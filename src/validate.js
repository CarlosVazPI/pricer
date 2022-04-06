import { pairs } from './utils.js'
import {
  getContent,
  isTerminal,
  getType,
  getToken
} from './parse.js'

export const getDefinedTerms = tree => {
  return getContent(tree[0])
    .filter(definition => getType(definition) === 'DEF')
    .map(definition => getContent(getContent(definition)[0]))
}
export const getDefinitions = tree => {
  return getContent(tree[0])
    .filter(definition => getType(definition) === 'DEF')
    .reduce((acc, { content }) => ({ ...acc, [content[0].content]: content[2] }), {})
}
export const getInjectableTerms = tree => {
  return getContent(tree[0])
    .filter(injectable => getType(injectable) === 'INJECTABLE')
    .reduce((acc, injectable) => {
      const content = getContent(injectable)
      const injectableKey = getContent(content[1])
      return [
        ...acc,
        ...pairs(content.slice(4)).reduce((acc, [_, token]) => [...acc, getContent(token)], [getContent(content[3])])
      ]
    }, [])
}

export const getTermsWithinDefinition = definition => {
  const termsWithinDefinition = []
  const stack = [...getContent(definition)]
  while (stack.length) {
    const node = stack.pop()
    if (getToken(node) === 'id') {
      termsWithinDefinition.push(getContent(node))
    }
    if (!isTerminal(node)) {
      stack.push(...getContent(node))
    }
  }
  return termsWithinDefinition
}

// export const validate = tree => {
//   const definitions = getDefinitions(tree)
//   let termsToDefine = Object.keys(definitions)
//   const injectableTerms = getInjectableTerms(tree)
//   const fullyDefinedTerms = [...injectableTerms]
//   const termsWithinDefinition = new Map(termsToDefine.map(term => [term, getTermsWithinDefinition(definitions[termToDefine])]))
//   const nonDefinedTerms =
//   let numberOfFullyDefinedTerms
//   while (numberOfFullyDefinedTerms != fullyDefinedTerms.length) {
//     numberOfFullyDefinedTerms = fullyDefinedTerms.length
//     const newFullyDefinedTerms = termsToDefine.filter(termToDefine => {
//       return termsWithinDefinition.get(termToDefine).every(term => fullyDefinedTerms.includes(term))
//     })
//     termsToDefine = termsToDefine.filter(term => !newFullyDefinedTerms.includes(term))
//     fullyDefinedTerms.push(...newFullyDefinedTerms)
//   }
//   const circularDefinitionTerms = termsToDefine.filter(term => termsWithinDefinition.get(term).includes(term))
//   const unusedInjectableTerms = injectableTerms.filter(injectTerm => !Object.keys(definitions).some(defTerm => termsWithinDefinition.get(defTerm).includes(injectTerm)))
//   const definedTerms = getDefinedTerms(tree)
//   return [
//     ...unusedInjectableTerms.map(term => ({ severity: 'warning', message: `Injectable '${term}' is unused`})),
//     ...injectableTerms.filter((term, i) => injectableTerms.slice(i + 1).includes(term)).map(term => ({ severity: 'error', message: `Injectable '${term}' is declared several times` })),
//     ...definedTerms.filter((term, i) => definedTerms.slice(i + 1).includes(term)).map(term => ({ severity: 'error', message: `Term '${term}' is declared several times` })),
//     ...circularDefinitionTerms.map(term => ({ severity: 'error', message: `Term '${term}' has a circular definition`})),
//     ...termsToDefine.map(improperlyDefinedTerm => {
//       return termsWithinDefinition.get(improperlyDefinedTerm)
//         .filter(term => !fullyDefinedTerms.includes(term))
//         .map(term => ({ severity: 'error', message: `Term '${term}' within the definition of '${improperlyDefinedTerm}' is not defined` }))
//     }).flat()
//   ]
// }
