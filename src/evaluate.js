import { pairs } from './utils.js'
import { tokenize } from './tokenize.js'
import { parse } from './parse.js'

const collapse = reductorHash => (root, evaluateKey) => {
  const reductor = reductorHash[root.type]
  if (!reductor) return root
  if (root.type === 'literal' || root.type === 'token') return evaluateKey(root.content)
  const next = root.content.map(child => collapse(reductorHash)(child, evaluateKey))
  return reductor(...next)
}

export const evaluate = (inputString, valueHash = {}) => {
  const beginTime = Date.now()
  const tokens = tokenize(inputString)
  const [tree, last] = parse(tokens)
  if (last !== tokens.length) {
    throw new Error(`Could only parse ${last} tokens out of the input ${tokens.length}. Final token at ${tokens[tokens.length - 1].location.join(':')}`)
  }
  const definitions = tree[0].content.reduce((acc, { content }) => ({ ...acc, [content[0].content]: content[2] }), {})
  const collapser = collapse({
    expr: (value, condition, _1, expressionIf, _2, expressionElse) => value !== 'if' ? value : condition ? expressionIf : expressionElse,
    comp: op => op == '>' ? (a, b) => a > b
      : op == '<' ? (a, b) => a < b
      : op == '>=' ? (a, b) => a >= b
      : op == '<=' ? (a, b) => a <= b
      : op == '==' ? (a, b) => a == b
      : op == '!=' ? (a, b) => a != b
      : (() => {throw new Error(`Unknown comparator '${op}'`)})(),
    boolOp0: op => op === '&&' ? (a, b) => a && b : op === '||' ? (a, b) => a || b : (() => {throw new Error(`Unknown boolean operator ${op}`)})(),
    predBase: (value1, comp, value2) => comp(value1, value2),
    pred: (predBaseOrNeg, predBase) => predBaseOrNeg === '!' ? !predBase : predBaseOrNeg,
    condition: (pred, ...rest) => pairs(rest).reduce((acc, [op, value]) => op(acc, value), pred),
    op1: op => op === '*' ? (a, b) => a * b : op === '/' ? (a, b) => a / b : (() => {throw new Error(`Unknown operator ${op}`)})(),
    op0: op => op === '+' ? (a, b) => a + b : op === '-' ? (a, b) => a - b : (() => {throw new Error(`Unknown operator ${op}`)})(),
    factor: (baseOrMinus, base) => baseOrMinus === '-' ? -base : baseOrMinus,
    sum: (factor, ...rest) => pairs(rest).reduce((acc, [op, value]) => op(acc, value), factor),
    value: (sum, ...rest) => pairs(rest).reduce((acc, [op, value]) => op(acc, value), sum),
    base: (valueOrParenthesis, maybeValue) => valueOrParenthesis === '(' ? +maybeValue : +valueOrParenthesis,
    literal: literal => literal in valueHash ? valueHash[literal] : literal,
    token: token => token in valueHash ? valueHash[token] : token
  })
  console.log(`Definitions parsed in ${((Date.now() - beginTime)/1000).toFixed(2)}s`)
  const evaluateKey = key => {
    if (key in valueHash) return valueHash[key]
    if (!(key in definitions)) return key
    return valueHash[key] = collapser(definitions[key], evaluateKey)
  }
  return key => {
    const beginTime = Date.now()
    const evaluation = evaluateKey(key)
    console.log(`'${key}' evaluated in ${((Date.now() - beginTime)/1000).toFixed(2)}s`)
    return evaluation
  }
}
