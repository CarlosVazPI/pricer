import assert from 'assert'
import { tokenize } from '../src/tokenize.js'
import { parse } from '../src/parse.js'
import { evaluate } from '../src/evaluate.js'

describe('evaluate', () => {
  it('evaluates a trivial value', () => {
    assert.equal(evaluate(parse(tokenize('a = 1')), 'a'), 1)
  })
  it('evaluates a hash value', () => {
    assert.equal(evaluate(parse(tokenize('a = 1')), 'b', { b: 2 }), 2)
  })
  it('evaluates a value coming from the hash', () => {
    assert.equal(evaluate(parse(tokenize('a = b')), 'a', { b: 1 }), 1)
  })
  it('evaluates a value coming from the hash', () => {
    assert.equal(evaluate(parse(tokenize('a = b + c b = 1')), 'a', { c: 2 }), 3)
  })
})
