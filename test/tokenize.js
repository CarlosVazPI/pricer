import assert from 'assert'
import {
  tokenize
} from '../src/tokenize.js'

describe('tokenize', () => {
  it('should return [] when input is empty', () => {
    assert.deepEqual(tokenize(''), [])
  })
  it('should correctly parse numbers', () => {
    assert.deepEqual(tokenize('1 1.1 0.5 15.12'), [{
      "token": "num",
      "value": "1",
      "location": [1, 0]
    }, {
      "token": "num",
      "value": "1.1",
      "location": [1, 2]
    }, {
      "token": "num",
      "value": "0.5",
      "location": [1, 6]
    }, {
      "token": "num",
      "value": "15.12",
      "location": [1, 10]
    }])
  })
  it('should correctly return the tokens of an input', () => {
    const input = `term = )) && oth,er_term $split
term 123 123.123 * - + / ! || ( ( <= < > >= != end :`
    assert.deepEqual(tokenize(input), [{
      "token": "id",
      "value": "term",
      "location": [1, 0]
    }, {
      "token": "symbol",
      "value": "=",
      "location": [1, 5]
    }, {
      "token": "symbol",
      "value": ")",
      "location": [1, 7]
    }, {
      "token": "symbol",
      "value": ")",
      "location": [1, 8]
    }, {
      "token": "symbol",
      "value": "&&",
      "location": [1, 10]
    }, {
      "token": "id",
      "value": "oth",
      "location": [1, 13]
    }, {
      "token": "symbol",
      "value": ",",
      "location": [1, 16]
    }, {
      "token": "id",
      "value": "er_term",
      "location": [1, 17]
    }, {
      "token": "symbol",
      "value": "$",
      "location": [1, 25]
    }, {
      "token": "id",
      "value": "split",
      "location": [1, 26]
    }, {
      "token": "id",
      "value": "term",
      "location": [2, 0]
    }, {
      "token": "num",
      "value": "123",
      "location": [2, 5]
    }, {
      "token": "num",
      "value": "123.123",
      "location": [2, 9]
    }, {
      "token": "symbol",
      "value": "*",
      "location": [2, 17]
    }, {
      "token": "symbol",
      "value": "-",
      "location": [2, 19]
    }, {
      "token": "symbol",
      "value": "+",
      "location": [2, 21]
    }, {
      "token": "symbol",
      "value": "/",
      "location": [2, 23]
    }, {
      "token": "symbol",
      "value": "!",
      "location": [2, 25]
    }, {
      "token": "symbol",
      "value": "||",
      "location": [2, 27]
    }, {
      "token": "symbol",
      "value": "(",
      "location": [2, 30]
    }, {
      "token": "symbol",
      "value": "(",
      "location": [2, 32]
    }, {
      "token": "symbol",
      "value": "<=",
      "location": [2, 34]
    }, {
      "token": "symbol",
      "value": "<",
      "location": [2, 37]
    }, {
      "token": "symbol",
      "value": ">",
      "location": [2, 39]
    }, {
      "token": "symbol",
      "value": ">=",
      "location": [2, 41]
    }, {
      "token": "symbol",
      "value": "!=",
      "location": [2, 44]
    }, {
      "token": "id",
      "value": "end",
      "location": [2, 47]
    }, {
      "location": [
        2,
        51
      ],
      "token": "symbol",
      "value": ":"
    }])
  })
})
