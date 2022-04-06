import { tokenize } from './tokenize.js'
import { parse, isTerminal, getContent, evaluatorHash } from './parse.js'

const collapse = (root, evaluateKey) => {
  if (isTerminal(root)) return evaluateKey(getContent(root))
  const reductor = evaluatorHash[root.type]
  if (!reductor) return root
  const next = root.content.map(child => collapse(child, evaluateKey))
  return reductor(...next)
}

export const evaluate = (tree, key, valueHash = {}) => {
  const definitions = tree[0].content
    .filter(({ content }) => content[0].content !== '$')
    .reduce((acc, { content }) => ({ ...acc, [content[0].content]: content[2] }), {})
  const evaluateKey = key => {
    if (key in valueHash) return valueHash[key]
    if (!(key in definitions)) return key
    return valueHash[key] = collapse(definitions[key], evaluateKey)
  }
  const beginTime = Date.now()
  const evaluation = evaluateKey(key)
  console.log(`'${key}' evaluated in ${((Date.now() - beginTime)/1000).toFixed(2)}s`)
  return evaluation
}
