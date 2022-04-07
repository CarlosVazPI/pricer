import { pairs } from './utils.js'
import {
  getContent,
  isTerminal,
  getType,
  getToken,
  getInjectableTermTokens,
  getDeclaredTermTokens,
  getDefinitionMap,
  getTermTokensWithinDefinition
} from './parse.js'

const sortByLocation = ({ location: a }, { location: b }) => a[0] - b[0] || a[1] - b[1]

export const validate = tree => {
  const definitionMap = getDefinitionMap(tree)
  const declaredTermTokens = getDeclaredTermTokens(tree)
  const injectableTermTokens = getInjectableTermTokens(tree)
  const termTokensWithinDefinition = new Map(declaredTermTokens.map(token => [token, getTermTokensWithinDefinition(definitionMap.get(token))]))
  const unusedInjectableTermTokens = injectableTermTokens.filter(({ content }) => !declaredTermTokens.some(term => termTokensWithinDefinition.get(term).find(token => token.content === content)))
  const injectableTerms = injectableTermTokens.map(({ content }) => content)
  let fullyDefinedTermTokensSet = new Set(injectableTermTokens)
  let termTokensToDefine = [
    ...declaredTermTokens,
    ...declaredTermTokens.map(token => termTokensWithinDefinition.get(token)).filter(({ content }) => !injectableTerms.includes(content))
  ].flat()
  let numberOfFullyDefinedTermTokens
  let fullyDefinedTerms
  while (numberOfFullyDefinedTermTokens != fullyDefinedTermTokensSet.size) {
    numberOfFullyDefinedTermTokens = fullyDefinedTermTokensSet.size
    fullyDefinedTerms = [...fullyDefinedTermTokensSet].map(({ content }) => content)
    const newFullyDefinedTermTokens = declaredTermTokens
      .filter(declaredTerm => {
        return termTokensWithinDefinition.get(declaredTerm).every(({ content }) => fullyDefinedTerms.includes(content))
      })
    termTokensToDefine = termTokensToDefine.filter(term => !newFullyDefinedTermTokens.includes(term))
    newFullyDefinedTermTokens.forEach(term => fullyDefinedTermTokensSet.add(term))
  }
  fullyDefinedTerms = [...fullyDefinedTermTokensSet].map(({ content }) => content)
  const duplicatedInjectableTerms = injectableTerms.filter((term, i) => injectableTerms.slice(i + 1).includes(term))
  const duplicatedInjectableTermTokens = injectableTermTokens.filter(({ content }) => duplicatedInjectableTerms.includes(content))
  const declaredTerms = declaredTermTokens.map(({ content }) => content)
  const duplicatedDeclaredTerms = declaredTerms.filter((term, i) => declaredTerms.slice(i + 1).includes(term))
  const duplicatedDeclaredTermTokens = declaredTermTokens.filter(({ content }) => duplicatedDeclaredTerms.includes(content))
  const circularDefinitionTermTokens = declaredTermTokens.filter(term => termTokensWithinDefinition.get(term).find(({ content }) => content === term.content))
  const undeclaredTermTokens = declaredTermTokens.map(declaredTerm => termTokensWithinDefinition.get(declaredTerm)).flat().filter(({ content }) => !fullyDefinedTerms.includes(content) && !declaredTermTokens.find(declaredTerm => declaredTerm.content === content))
  const nonFullyDefinedTermTokens = declaredTermTokens.filter(declaredTerm => !circularDefinitionTermTokens.find(({ content }) => content === declaredTerm.content) && termTokensWithinDefinition.get(declaredTerm).some(({ content }) => !fullyDefinedTerms.includes(content)))

  return [
    ...unusedInjectableTermTokens.map(({ content, location }) => ({ location, severity: 'warning', message: `Injectable '${content}' is unused. At ${location.join(':')}`})),
    ...duplicatedInjectableTermTokens.map(({ content, location }) => ({ location, severity: 'error', message: `Injectable '${content}' is declared several times. At ${location.join(':')}` })),
    ...duplicatedDeclaredTermTokens.map(({ content, location }) => ({ location, severity: 'error', message: `Term '${content}' is declared several times. At ${location.join(':')}` })),
    ...circularDefinitionTermTokens.map(({ content, location }) => ({ location, severity: 'error', message: `Term '${content}' has a circular definition. At ${location.join(':')}`})),
    ...undeclaredTermTokens.map(({ content, location }) => ({ location, severity: 'error', message: `Term '${content}' is not declared. At ${location.join(':')}`})),
    ...nonFullyDefinedTermTokens.map(({ content, location }) => ({ location, severity: 'error', message: `Term '${content}' is not fully defined. At ${location.join(':')}` }))
  ].sort(sortByLocation)
}
