import assert from 'assert'
import { pairs } from '../src/utils.js'

describe('utils', () => {
  describe('pairs', () => {
    it('should return [] when input is empty', () => {
      assert.deepEqual(pairs([]), [])
    })
    it('should split in pairs, leaving the last one undefined, when the input is odd', () => {
      assert.deepEqual(pairs([1, 2, 3, 4, 5]), [[1, 2], [3, 4], [5, undefined]])
    })
    it('should split perfectly in pairs, when the input is even', () => {
      assert.deepEqual(pairs([1, 2, 3, 4, 5, 6]), [[1, 2], [3, 4], [5, 6]])
    })
  })
})
