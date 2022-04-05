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

export const parse = input => axiom(input, 0)
export const isTerminal = ({ type }) => type === 'literal' || type === 'token'
export const getContent = ({ content }) => content
