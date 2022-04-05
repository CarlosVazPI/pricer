import assert from 'assert'
import {
  tokenize
} from '../src/tokenize.js'
import {
  isTerminal,
  getContent,
  parse
} from '../src/parse.js'

describe('parse', () => {
  describe('isTerminal', () => {
    it('should return false for a non terminal token', () => {
      assert.equal(isTerminal({ type: 'some type' }), false)
    })
    it('should return true for a literal', () => {
      assert.equal(isTerminal({ type: 'literal' }), true)
    })
    it('should return true for a token', () => {
      assert.equal(isTerminal({ type: 'token' }), true)
    })
  })
  describe('getContent', () => {
    it('should return the content of the node', () => {
      assert.equal(getContent({ content: 'some content' }), 'some content')
    })
  })
  describe('parse', () => {
    it('should parse a simple definition', () => {
      assert.deepEqual(parse(tokenize('a = 1')), [
        [{
          "type": "axiom",
          "content": [{
            "type": "def",
            "content": [{
              "type": "token",
              "content": "a"
            }, {
              "type": "literal",
              "content": "="
            }, {
              "type": "expr",
              "content": [{
                "type": "value",
                "content": [{
                  "type": "sum",
                  "content": [{
                    "type": "factor",
                    "content": [{
                      "type": "base",
                      "content": [{
                        "type": "token",
                        "content": "1"
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }], 3
      ])
    })
  })
})
