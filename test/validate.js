import assert from 'assert'
import {
  tokenize
} from '../src/tokenize.js'
import {
  parse
} from '../src/parse.js'
import {
  getInjectableTerms,
  getDefinedTerms,
  getDefinitions,
  getTermsWithinDefinition
} from '../src/validate.js'

describe('validate', () => {
  describe('getInjectableTerms', () => {
    it('should return the injectable terms', () => {
      assert.deepEqual(getInjectableTerms(parse(tokenize('$key1: a, b, c $key2: d, e, f x=a+b y=c*d'))), ['a', 'b', 'c', 'd', 'e', 'f'])
    })
    it('should return the injectable terms with duplicates when they are duplicated', () => {
      assert.deepEqual(getInjectableTerms(parse(tokenize('$key1: a, b, c $key2: d, b, f x=a+b y=c*d'))), ['a', 'b', 'c', 'd', 'b', 'f'])
    })
  })
  describe('getDefinedTerms', () => {
    it('should return the defined terms', () => {
      assert.deepEqual(getDefinedTerms(parse(tokenize('$key1: a, b, c $key2: d, e, f x=a+b y=c*d'))), ['x', 'y'])
    })
    it('should return the defined terms with duplicates when they are duplicated', () => {
      assert.deepEqual(getDefinedTerms(parse(tokenize('$key1: a, b, c $key2: d, b, f x=a+b y=c*d x=4'))), ['x', 'y', 'x'])
    })
  })
  describe('getDefinitions', () => {
    it('should return the definitions', () => {
      assert.deepEqual(getDefinitions(parse(tokenize('$key1: a, b, c $key2: d, e, f x=a+b y=c*d'))), {
        "x": {
          "type": "EXPR",
          "content": [{
            "type": "PRED",
            "content": [{
              "type": "VALUE",
              "content": [{
                "type": "SUM",
                "content": [{
                  "type": "FACTOR",
                  "content": [{
                    "type": "BASE",
                    "content": [{
                      "type": "token",
                      "token": "id",
                      "content": "a"
                    }]
                  }]
                }]
              }, {
                "type": "ARITH_OP_0",
                "content": [{
                  "type": "literal",
                  "content": "+"
                }]
              }, {
                "type": "SUM",
                "content": [{
                  "type": "FACTOR",
                  "content": [{
                    "type": "BASE",
                    "content": [{
                      "type": "token",
                      "token": "id",
                      "content": "b"
                    }]
                  }]
                }]
              }]
            }]
          }]
        },
        "y": {
          "type": "EXPR",
          "content": [{
            "type": "PRED",
            "content": [{
              "type": "VALUE",
              "content": [{
                "type": "SUM",
                "content": [{
                  "type": "FACTOR",
                  "content": [{
                    "type": "BASE",
                    "content": [{
                      "type": "token",
                      "token": "id",
                      "content": "c"
                    }]
                  }]
                }, {
                  "type": "ARITH_OP_1",
                  "content": [{
                    "type": "literal",
                    "content": "*"
                  }]
                }, {
                  "type": "FACTOR",
                  "content": [{
                    "type": "BASE",
                    "content": [{
                      "type": "token",
                      "token": "id",
                      "content": "d"
                    }]
                  }]
                }]
              }]
            }]
          }]
        }
      })
    })
    it('should return the definitions with only one definition for duplicates', () => {
      assert.deepEqual(getDefinitions(parse(tokenize('$key1: a, b, c $key2: d, b, f x=a+b y=c*d x=4'))), {
        "x": {
          "type": "EXPR",
          "content": [{
            "type": "PRED",
            "content": [{
              "type": "VALUE",
              "content": [{
                "type": "SUM",
                "content": [{
                  "type": "FACTOR",
                  "content": [{
                    "type": "BASE",
                    "content": [{
                      "type": "token",
                      "token": "num",
                      "content": "4"
                    }]
                  }]
                }]
              }]
            }]
          }]
        },
        "y": {
          "type": "EXPR",
          "content": [{
            "type": "PRED",
            "content": [{
              "type": "VALUE",
              "content": [{
                "type": "SUM",
                "content": [{
                  "type": "FACTOR",
                  "content": [{
                    "type": "BASE",
                    "content": [{
                      "type": "token",
                      "token": "id",
                      "content": "c"
                    }]
                  }]
                }, {
                  "type": "ARITH_OP_1",
                  "content": [{
                    "type": "literal",
                    "content": "*"
                  }]
                }, {
                  "type": "FACTOR",
                  "content": [{
                    "type": "BASE",
                    "content": [{
                      "type": "token",
                      "token": "id",
                      "content": "d"
                    }]
                  }]
                }]
              }]
            }]
          }]
        }
      })
    })
  })
  describe('getTermsWithinDefinition', () => {
    const definition = getDefinitions(parse(tokenize('$key1: a, b, c $key2: d, e, f x=a+b-y y=c*(2-if y then 1 else 2 end) z=1')))
    it('should return the terms within a shallow simple definition', () => {
      assert.deepEqual(getTermsWithinDefinition(definition['x']), ['y', 'b', 'a'])
    })
    it('should return the terms within a deep complex circular definition', () => {
      assert.deepEqual(getTermsWithinDefinition(definition['y']), ['y', 'c'])
    })
    it('should return empty for a definition without terms', () => {
      assert.deepEqual(getTermsWithinDefinition(definition['z']), [])
    })
  })
})
