/*

Value = Sum { Op0 Sum }.
Sum = Factor { Op1 Factor}.
Factor = ["-"] Base.
Base = num
     | id
     | "(" Value ")".
Op0 = "+" | "-".
Op1 = "*" | "/".
Condition = Pred { BoolOp0 Pred }.
Pred = ["!"] PredBase.
PredBase = Value Comp Value.
BoolOp0 = "&&" | "||".
Comp = ">" | ">=" | "<" | "<=" | "==" | "!=".
Def = id "=" Expr.
Expr = "if" Condition "then" Value "else" Value "end"
     | Value.
S = { Def }.

*/

const empty = []
const error = [Symbol('error')]
const isError = ([node]) => node === error
const concat = (...rules) => {
  const f = (input, index = 0) => {
    const result = []
    for (let rule of rules) {
      const output = rule(input, index)
      if (isError(output)) return [error, index]
      index = output[1]
      result.push(...output[0])
    }
    return [result, index]
  }
  f.key = rules.map(rule => rule.key).join(' ')
  return f
}
const disjunction = (...rules) => {
  const f = (input, index = 0) => {
    for (let rule of rules) {
      const output = rule(input, index)
      if (!isError(output)) return output
    }
    return [error, index]
  }
  f.key = rules.map(rule => rule.key).join(' | ')
  return f
}
const closure = rule => {
  const f = (input, index = 0) => {
    const result = []
    do {
      const output = rule(input, index)
      if (isError(output)) return [result, index]
      index = output[1]
      result.push(...output[0])
    } while (true)
    return [result, index]
  }
  f.key = `{ ${rule.key} }`
  return f
}
const option = rule => {
  const f = (input, index = 0) => {
    const output = rule(input, index)
    if (!isError(output)) return output
    return [empty, index]
  }
  f.key = `${rule.key}?`
  return f
}
const literal = lit => {
  const f = (input, index = 0) => {
    if (index < input.length && input[index].value === lit) return [[{ type: 'literal', content: input[index].value }], index + 1]
    return [error, index]
  }
  f.key = `'${lit}'`
  return f
}
const token = tkn => {
  const f = (input, index = 0) => {
    if (index < input.length && input[index].token === tkn) return [[{ type: 'token', content: input[index].value }], index + 1]
    return [error, index]
  }
  f.key = `:${tkn}`
  return f
}
const expect = (expectation, rule) => {
  const f = (input, index = 0) => {
    const output = rule(input, index)
    if (isError(output)) {
      throw new Error(`Expected ${expectation}. '${index < input.length ? input[index].value: 'End of input'}' found instead. At ${index < input.length ? input[index].location.join(':') : 'end of input'}`)
    }
    return output
  }
  f.key = `${rule.key}!`
  return f
}

const astNodeRule = (type, rule) => (input, index = 0) => {
  const output = rule(input, index)
  if (isError(output)) return output
  const [content, newIndex] = output
  return [[{ type, content }], newIndex]
}

const value = (input, index) => astNodeRule('value', concat(sum, closure(concat(op0, expect('a sumator after the operator', sum)))))(input, index)
const sum = (input, index) => astNodeRule('sum', concat(factor, closure(concat(op1, expect('a factor after the operator', factor)))))(input, index)
const factor = (input, index) => astNodeRule('factor', concat(option(literal('-')), base))(input, index)
const base = (input, index) => astNodeRule('base', disjunction(token('num'), token('id'), concat(literal('('), expect('a value between the parentheses', value), expect('literal ")"', literal(')')))))(input, index)
const op0 = (input, index) => astNodeRule('op0', disjunction(literal('+'), literal('-')))(input, index)
const op1 = (input, index) => astNodeRule('op1', disjunction(literal('*'), literal('/')))(input, index)
const condition = (input, index) => astNodeRule('condition', concat(pred, closure(boolOp0, pred)))(input, index)
const pred = (input, index) => astNodeRule('pred', concat(option(literal('!')), predBase))(input, index)
const predBase = (input, index) => astNodeRule('predBase', concat(value, expect('a comparison operator', comp), expect('a value after the comparison operator', value)))(input, index)
const boolOp0 = (input, index) => astNodeRule('boolOp0', disjunction(literal('&&'), literal('||')))(input, index)
const comp = (input, index) => astNodeRule('comp', disjunction(literal('>'), literal('<'), literal('>='), literal('<='), literal('=='), literal('!=')))(input, index)
const def = (input, index) => astNodeRule('def', concat(token('id'), expect('"=" symbol', literal('=')), expect('a value after the "=" symbol', expr)))(input, index)
const expr = (input, index) => astNodeRule('expr', disjunction(concat(literal('if'), expect('a condition', condition), expect('"then"', literal('then')), expect('a value after "then"', value), expect('"else"', literal('else')), expect('a value after "else"', value), expect('"end"', literal('end'))), value))(input, index)
const axiom = (input, index) => astNodeRule('axiom', closure(def))(input, index)

const tokenize = inputString => {
  const regexps = {
    ws: /\s+/,
    id: /[a-zA-Z_][a-zA-z0-9_]*/,
    num: /[0-9]+(.[0-9]+)?/,
    symbol: /\+|\-|\*|\/|==?|<=?|>=?|!=?|\(|\)|&&?|\|\|?/
  }
  const location = [1, 0]
  const tokens = []
  while (inputString.length) {
    const token = Object.keys(regexps).find(key => inputString.match(regexps[key])?.index === 0)
    if (!token) throw new Error(`Cannot split input, in '${inputString.slice(0, 32)}...', at ${location.join(':')}`)
    const value = inputString.match(regexps[token])[0]
    inputString = inputString.slice(value.length)
    if (token !== 'ws') {
      tokens.push({ token, value, location: [...location] })
    }
    const rows = value.split('\n')
    location[0] += rows.length - 1
    location[1] = rows.length > 1 ? rows[rows.length - 1].length : location[1] + rows[0].length
  }
  return tokens
}

const collapse = reductorHash => (root, evaluateKey) => {
  const reductor = reductorHash[root.type]
  if (!reductor) return root
  if (root.type === 'literal' || root.type === 'token') return evaluateKey(root.content)
  const next = root.content.map(child => collapse(reductorHash)(child, evaluateKey))
  return reductor(...next)
}

const pairs = array => {
  const result = []
  for (let i = 0; i < array.length; i += 2) {
    result.push([array[i], array[i + 1]])
  }
  return result
}

const evaluate = (inputString, valueHash) => {
  const beginTime = Date.now()
  const tokens = tokenize(inputString)
  const [tree, last] = axiom(tokens, 0)
  if (last !== tokens.length) {
    console.error(`Could only parse ${last} tokens out of the input ${tokens.length}`)
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

// evaluate('optimal_sample_price = panel_size * fixed_incidence_rate_price * sample_handling_multiplier', {
//   panel_size: 100,
//   fixed_incidence_rate_price: 11.5,
//   sample_handling_multiplier: 1
// })('optimal_sample_price')
// evaluate('result = if potato > 1 then potato + banana * apple', {
//   potato: 11.5,
//   banana: 2,
//   apple: 3
// })('result')
// evaluate('result = if potato > 1 then potato + banana * apple else 2.2 end', {
//   potato: 0.5,
//   banana: 2,
//   apple: 3
// })('result')
