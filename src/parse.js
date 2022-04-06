import { pairs } from './utils.js'

const empty = []
const error = [Symbol('error')]
const isError = ([node]) => node === error
const concat = (...rules) => (input, index = 0) => {
  const result = []
  for (let rule of rules) {
    const output = rule(input, index)
    if (isError(output)) return [error, index]
    index = output[1]
    result.push(...output[0])
  }
  return [result, index]
}
const disjunction = (...rules) => (input, index = 0) => {
  for (let rule of rules) {
    const output = rule(input, index)
    if (!isError(output)) return output
  }
  return [error, index]
}
const closure = rule => (input, index = 0) => {
  const result = []
  do {
    const output = rule(input, index)
    if (isError(output)) return [result, index]
    index = output[1]
    result.push(...output[0])
  } while (true)
  return [result, index]
}
const option = rule => (input, index = 0) => {
  const output = rule(input, index)
  if (!isError(output)) return output
  return [empty, index]
}
const literal = lit => (input, index = 0) => {
  if (index < input.length && input[index].value === lit) return [[{ type: 'literal', content: input[index].value }], index + 1]
  return [error, index]
}
const token = tkn => (input, index = 0) => {
  if (index < input.length && input[index].token === tkn) return [[{ type: 'token', content: input[index].value }], index + 1]
  return [error, index]
}
const expect = (expectation, rule) => (input, index = 0) => {
  const output = rule(input, index)
  if (isError(output)) {
    throw new Error(`Expected ${expectation}. '${index < input.length ? input[index].value: 'End of input'}' found instead. At ${index < input.length ? input[index].location.join(':') : 'end of input'}`)
  }
  return output
}
const astNodeRule = (type, rule) => (input, index = 0) => {
  const output = rule(input, index)
  if (isError(output)) return output
  const [content, newIndex] = output
  return [[{ type, content }], newIndex]
}

const COMP_OP = 'COMP_OP'
const LOGIC_OP = 'LOGIC_OP'
const ARITH_OP_0 = 'ARITH_OP_0'
const ARITH_OP_1 = 'ARITH_OP_1'
const UNARY_OP = 'UNARY_OP'
const BASE = 'BASE'
const FACTOR = 'FACTOR'
const SUM = 'SUM'
const VALUE = 'VALUE'
const PRED = 'PRED'
const EXPR = 'EXPR'
const DEF = 'DEF'
const INJECTABLE = 'INJECTABLE'
const AXIOM = 'AXIOM'

const compOp = (input, index) => astNodeRule(COMP_OP, disjunction(literal('>'), literal('<'), literal('>='), literal('<='), literal('=='), literal('!=')))(input, index)
const logicOp = (input, index) => astNodeRule(LOGIC_OP, disjunction(literal('&&'), literal('||')))(input, index)
const arithmeticOp0 = (input, index) => astNodeRule(ARITH_OP_0, disjunction(literal('+'), literal('-')))(input, index)
const arithmeticOp1 = (input, index) => astNodeRule(ARITH_OP_1, disjunction(literal('*'), literal('/')))(input, index)
const unaryOp = (input, index) => astNodeRule(UNARY_OP, disjunction(literal('!'), literal('-')))(input, index)
const base = (input, index) => astNodeRule(BASE, disjunction(
  token('num'),
  literal('true'),
  literal('false'),
  concat(literal('('), expect('a value between the parentheses', expr), expect('literal ")"', literal(')'))),
  concat(literal('if'), expect('a condition', expr), expect('"then"', literal('then')), expect('an expression after "then"', expr), expect('"else"', literal('else')), expect('an expression after "else"', expr), expect('"end"', literal('end'))),
  token('id')
))(input, index)
const factor = (input, index) => astNodeRule(FACTOR, concat(option(unaryOp), base))(input, index)
const sum = (input, index) => astNodeRule(SUM, concat(factor, closure(concat(arithmeticOp1, expect('a factor after the operator', factor)))))(input, index)
const value = (input, index) => astNodeRule(VALUE, concat(sum, closure(concat(arithmeticOp0, expect('a sumator after the operator', sum)))))(input, index)
const pred = (input, index) => astNodeRule(PRED, concat(value, option(concat(compOp, expect('a predicate after the comparison operator', pred)))))(input, index)
const expr = (input, index) => astNodeRule(EXPR, concat(pred, closure(concat(logicOp, expect('a predicate after the logic operator', pred)))))(input, index)
const def = (input, index) => astNodeRule(DEF, concat(token('id'), expect('"=" symbol', literal('=')), expect('an expression after the "=" symbol', expr)))(input, index)
const injectable = (input, index) => astNodeRule(INJECTABLE, concat(literal("$"), token('id'), literal('='), token('id'), closure(concat(literal(','), token('id')))))(input, index)
const axiom = (input, index) => astNodeRule(AXIOM, concat(closure(injectable), closure(def)))(input, index)

export const parse = tokens => {
  const beginTime = Date.now()
  const [tree, last] = axiom(tokens, 0)
  console.log(`Parsed in ${((Date.now() - beginTime)/1000).toFixed(2)}s`)
  if (last !== tokens.length) {
    throw new Error(`Unexpected token ${tokens[last].token} (${tokens[last].value}). Expected end of input. At ${tokens[last].location.join(':')}`)
  }
  return tree
}
export const isTerminal = ({ type }) => type === 'literal' || type === 'token'
export const getType = ({ type }) => type
export const getContent = ({ content }) => content
export const evaluatorHash = {
  [EXPR]: (pred, ...rest) => pairs(rest).reduce((acc, [op, pred]) => op(acc, pred), pred),
  [PRED]: (value1, compOp, value2) => compOp ? compOp(value1, value2) : value1,
  [VALUE]: (sum, ...rest) => pairs(rest).reduce((acc, [op, value]) => op(acc, value), sum),
  [SUM]: (factor, ...rest) => pairs(rest).reduce((acc, [op, value]) => op(acc, value), factor),
  [FACTOR]: (baseOrUnaryOp, base) => base === undefined ? baseOrUnaryOp : baseOrUnaryOp(base),
  [BASE]: (valueParIf, expr1, _1, expr2, _2, expr3) => valueParIf === 'true' ? true
    : valueParIf === 'false' ? false
    : valueParIf === '(' ? expr1
    : valueParIf === 'if' ? (expr1 ? expr2 : expr3)
    : +valueParIf,
  [UNARY_OP]: op => op === '-' ? x => -x : op === '!' ? x => !x : (() => {throw new Error(`Unknown unary operator ${op}`)})(),
  [ARITH_OP_0]: op => op === '+' ? (a, b) => a + b : op === '-' ? (a, b) => a - b : (() => {throw new Error(`Unknown arithmetic operator ${op}`)})(),
  [ARITH_OP_1]: op => op === '*' ? (a, b) => a * b : op === '/' ? (a, b) => a / b : (() => {throw new Error(`Unknown arithmetic operator ${op}`)})(),
  [LOGIC_OP]: op => op === '&&' ? (a, b) => a && b : op === '||' ? (a, b) => a || b : (() => {throw new Error(`Unknown logic operator ${op}`)})(),
  [COMP_OP]: op => op == '>' ? (a, b) => a > b
    : op == '<' ? (a, b) => a < b
    : op == '>=' ? (a, b) => a >= b
    : op == '<=' ? (a, b) => a <= b
    : op == '==' ? (a, b) => a == b
    : op == '!=' ? (a, b) => a != b
    : (() => {throw new Error(`Unknown comparison operator '${op}'`)})()
}
