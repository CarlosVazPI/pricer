import assert from 'assert'
import { evaluate } from '../src/evaluate.js'

describe('evaluate', () => {
  describe('evaluator parsing', () => {
    it('does not throw an error', () => {
      assert.doesNotThrow(evaluate('a = 1'))
    })
    it('throws an error when broken definition', () => {
      assert.throws(() => evaluate('a ='), { name: 'Error', message: `Expected a value after the "=" symbol. 'End of input' found instead. At end of input` })
    })
    it('throws an error when broken sum at end', () => {
      assert.throws(() => evaluate('a = 1 +'), { name: 'Error', message: `Expected a sumator after the operator. 'End of input' found instead. At end of input` })
    })
    it('throws an error when broken factor not at end', () => {
      assert.throws(() => evaluate('a = 1 * + 2 '), { name: 'Error', message: `Expected a factor after the operator. '+' found instead. At 1:8` })
    })
  })
  describe('evaluation', () => {
    it('evaluates a trivial value', () => {
      assert.equal(evaluate('a = 1')('a'), 1)
    })
    it('evaluates a value coming from the hash', () => {
      assert.equal(evaluate('a = b', { b: 1 })('a'), 1)
    })
    it('evaluates a value coming from the hash', () => {
      assert.equal(evaluate('a = b + c b = 1', { c: 2 })('a'), 3)
    })
  })
})
