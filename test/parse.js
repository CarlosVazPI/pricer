import assert from 'assert'
import {
  tokenize
} from '../src/tokenize.js'
import {
  isTerminal,
  getType,
  getContent,
  getInjectableTermTokens,
  getDeclaredTermTokens,
  getDefinitionMap,
  getTermTokensWithinDefinition,
  parse,
  evaluatorHash,
  COMP_OP,
  LOGIC_OP,
  ARITH_OP_0,
  ARITH_OP_1,
  UNARY_OP,
  BASE,
  FACTOR,
  SUM,
  VALUE,
  PRED,
  EXPR
} from '../src/parse.js'

describe('parse', () => {
  describe('evaluatorHash', () => {
    describe('COMP_OP', () => {
      it('should evaluate >', () => {
        assert.equal(evaluatorHash[COMP_OP]('>')(2, 1), true)
        assert.equal(evaluatorHash[COMP_OP]('>')(1, 1), false)
        assert.equal(evaluatorHash[COMP_OP]('>')(1, 2), false)
      })
      it('should evaluate >=', () => {
        assert.equal(evaluatorHash[COMP_OP]('>=')(2, 1), true)
        assert.equal(evaluatorHash[COMP_OP]('>=')(1, 1), true)
        assert.equal(evaluatorHash[COMP_OP]('>=')(1, 2), false)
      })
      it('should evaluate <', () => {
        assert.equal(evaluatorHash[COMP_OP]('<')(2, 1), false)
        assert.equal(evaluatorHash[COMP_OP]('<')(1, 1), false)
        assert.equal(evaluatorHash[COMP_OP]('<')(1, 2), true)
      })
      it('should evaluate <=', () => {
        assert.equal(evaluatorHash[COMP_OP]('<=')(2, 1), false)
        assert.equal(evaluatorHash[COMP_OP]('<=')(1, 1), true)
        assert.equal(evaluatorHash[COMP_OP]('<=')(1, 2), true)
      })
      it('should evaluate ==', () => {
        assert.equal(evaluatorHash[COMP_OP]('==')(2, 1), false)
        assert.equal(evaluatorHash[COMP_OP]('==')(1, 1), true)
        assert.equal(evaluatorHash[COMP_OP]('==')(1, 2), false)
      })
      it('should evaluate !=', () => {
        assert.equal(evaluatorHash[COMP_OP]('!=')(2, 1), true)
        assert.equal(evaluatorHash[COMP_OP]('!=')(1, 1), false)
        assert.equal(evaluatorHash[COMP_OP]('!=')(1, 2), true)
      })
    })
    describe('LOGIC_OP', () => {
      it('should evaluate &&', () => {
        assert.equal(evaluatorHash[LOGIC_OP]('&&')(true, true), true)
        assert.equal(evaluatorHash[LOGIC_OP]('&&')(true, false), false)
        assert.equal(evaluatorHash[LOGIC_OP]('&&')(false, true), false)
        assert.equal(evaluatorHash[LOGIC_OP]('&&')(false, false), false)
      })
      it('should evaluate ||', () => {
        assert.equal(evaluatorHash[LOGIC_OP]('||')(true, true), true)
        assert.equal(evaluatorHash[LOGIC_OP]('||')(true, false), true)
        assert.equal(evaluatorHash[LOGIC_OP]('||')(false, true), true)
        assert.equal(evaluatorHash[LOGIC_OP]('||')(false, false), false)
      })
    })
    describe('ARITH_OP_0', () => {
      it('should evaluate +', () => {
        assert.equal(evaluatorHash[ARITH_OP_0]('+')(3, 2), 5)
      })
      it('should evaluate -', () => {
        assert.equal(evaluatorHash[ARITH_OP_0]('-')(3, 2), 1)
      })
    })
    describe('ARITH_OP_1', () => {
      it('should evaluate *', () => {
        assert.equal(evaluatorHash[ARITH_OP_1]('*')(3, 2), 6)
      })
      it('should evaluate /', () => {
        assert.equal(evaluatorHash[ARITH_OP_1]('/')(3, 2), 1.5)
      })
    })
    describe('UNARY_OP', () => {
      it('should evaluate !', () => {
        assert.equal(evaluatorHash[UNARY_OP]('!')(true), false)
        assert.equal(evaluatorHash[UNARY_OP]('!')(false), true)
      })
      it('should evaluate -', () => {
        assert.equal(evaluatorHash[UNARY_OP]('-')(3), -3)
      })
    })
    describe('BASE', () => {
      it('should evaluate a boolean', () => {
        assert.equal(evaluatorHash[BASE]('true'), true)
        assert.equal(evaluatorHash[BASE]('false'), false)
      })
      it('should evaluate a number', () => {
        assert.equal(evaluatorHash[BASE]('1234'), 1234)
      })
      it('should evaluate a value between parenthese', () => {
        assert.equal(evaluatorHash[BASE]('(', 'value', ')'), 'value')
      })
      it('should evaluate a conditional', () => {
        assert.equal(evaluatorHash[BASE]('if', true, 'then', 'one', 'else', 'two', 'end'), 'one')
        assert.equal(evaluatorHash[BASE]('if', false, 'then', 'one', 'else', 'two', 'end'), 'two')
      })
    })
    describe('FACTOR', () => {
      it('should evaluate a base preceded by a unary operation', () => {
        assert.equal(evaluatorHash[FACTOR](x => x * 2, 25), 50)
      })
      it('should evaluate a base', () => {
        assert.equal(evaluatorHash[FACTOR](25), 25)
      })
    })
    describe('SUM', () => {
      it('should evaluate a single number', () => {
        assert.equal(evaluatorHash[SUM](1), 1)
      })
      it('should reduce an array', () => {
        const add = (a, b) => a + b
        assert.equal(evaluatorHash[SUM](1, add, 1, add, 2, add, 3, add, 5, add, 8), 20)
      })
    })
    describe('VALUE', () => {
      it('should evaluate a single number', () => {
        assert.equal(evaluatorHash[VALUE](1), 1)
      })
      it('should reduce an array', () => {
        const add = (a, b) => a + b
        assert.equal(evaluatorHash[VALUE](1, add, 1, add, 2, add, 3, add, 5, add, 8), 20)
      })
    })
    describe('PRED', () => {
      it('should evaluate a single value', () => {
        assert.equal(evaluatorHash[PRED](1), 1)
      })
      it('should reduce an operation', () => {
        const add = (a, b) => a + b
        assert.equal(evaluatorHash[PRED](1, add, 2), 3)
      })
    })
    describe('EXPR', () => {
      it('should evaluate a single number', () => {
        assert.equal(evaluatorHash[EXPR](1), 1)
      })
      it('should reduce an array', () => {
        const add = (a, b) => a + b
        assert.equal(evaluatorHash[EXPR](1, add, 1, add, 2, add, 3, add, 5, add, 8), 20)
      })
    })
  })
  describe('getInjectableTermTokens', () => {
    it('should return the injectable terms', () => {
      assert.deepEqual(getInjectableTermTokens(parse(tokenize('$key1: a, b, c $key2: d, e, f x=a+b y=c*d'))), [{
        "type": "token",
        "token": "id",
        "content": "a",
        "location": [1, 7]
      }, {
        "type": "token",
        "token": "id",
        "content": "b",
        "location": [1, 10]
      }, {
        "type": "token",
        "token": "id",
        "content": "c",
        "location": [1, 13]
      }, {
        "type": "token",
        "token": "id",
        "content": "d",
        "location": [1, 22]
      }, {
        "type": "token",
        "token": "id",
        "content": "e",
        "location": [1, 25]
      }, {
        "type": "token",
        "token": "id",
        "content": "f",
        "location": [1, 28]
      }])
    })
    it('should return the injectable terms with duplicates when they are duplicated', () => {
      assert.deepEqual(getInjectableTermTokens(parse(tokenize('$key1: a, b, c $key2: d, b, f x=a+b y=c*d'))), [{
        "type": "token",
        "token": "id",
        "content": "a",
        "location": [1, 7]
      }, {
        "type": "token",
        "token": "id",
        "content": "b",
        "location": [1, 10]
      }, {
        "type": "token",
        "token": "id",
        "content": "c",
        "location": [1, 13]
      }, {
        "type": "token",
        "token": "id",
        "content": "d",
        "location": [1, 22]
      }, {
        "type": "token",
        "token": "id",
        "content": "b",
        "location": [1, 25]
      }, {
        "type": "token",
        "token": "id",
        "content": "f",
        "location": [1, 28]
      }])
    })
  })
  describe('getDeclaredTermTokens', () => {
    it('should return the defined terms', () => {
      assert.deepEqual(getDeclaredTermTokens(parse(tokenize('$key1: a, b, c $key2: d, e, f x=a+b y=c*d'))), [{
        "type": "token",
        "token": "id",
        "content": "x",
        "location": [1, 30]
      }, {
        "type": "token",
        "token": "id",
        "content": "y",
        "location": [1, 36]
      }])
    })
    it('should return the defined terms with duplicates when they are duplicated', () => {
      assert.deepEqual(getDeclaredTermTokens(parse(tokenize('$key1: a, b, c $key2: d, b, f x=a+b y=c*d x=4'))), [{
        "type": "token",
        "token": "id",
        "content": "x",
        "location": [1, 30]
      }, {
        "type": "token",
        "token": "id",
        "content": "y",
        "location": [1, 36]
      }, {
        "type": "token",
        "token": "id",
        "content": "x",
        "location": [1, 42]
      }])
    })
  })
  describe('getDefinitionMap', () => {
    it('should return the definitions', () => {
      assert.deepEqual([...getDefinitionMap(parse(tokenize('$key1: a, b, c $key2: d, e, f x=a+b y=c*d'))).entries()], [
        [{
          "type": "token",
          "token": "id",
          "content": "x",
          "location": [1, 30]
        }, {
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
                      "content": "a",
                      "location": [1, 32]
                    }]
                  }]
                }]
              }, {
                "type": "ARITH_OP_0",
                "content": [{
                  "type": "literal",
                  "content": "+",
                  "location": [1, 33]
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
                      "content": "b",
                      "location": [1, 34]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }],
        [{
          "type": "token",
          "token": "id",
          "content": "y",
          "location": [1, 36]
        }, {
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
                      "content": "c",
                      "location": [1, 38]
                    }]
                  }]
                }, {
                  "type": "ARITH_OP_1",
                  "content": [{
                    "type": "literal",
                    "content": "*",
                    "location": [1, 39]
                  }]
                }, {
                  "type": "FACTOR",
                  "content": [{
                    "type": "BASE",
                    "content": [{
                      "type": "token",
                      "token": "id",
                      "content": "d",
                      "location": [1, 40]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }]
      ])
    })
    it('should return the definitions even when there are duplicates', () => {
      assert.deepEqual([...getDefinitionMap(parse(tokenize('$key1: a, b, c $key2: d, b, f x=a+b y=c*d x=4'))).entries()], [
        [{
          "type": "token",
          "token": "id",
          "content": "x",
          "location": [1, 30]
        }, {
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
                      "content": "a",
                      "location": [1, 32]
                    }]
                  }]
                }]
              }, {
                "type": "ARITH_OP_0",
                "content": [{
                  "type": "literal",
                  "content": "+",
                  "location": [1, 33]
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
                      "content": "b",
                      "location": [1, 34]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }],
        [{
          "type": "token",
          "token": "id",
          "content": "y",
          "location": [1, 36]
        }, {
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
                      "content": "c",
                      "location": [1, 38]
                    }]
                  }]
                }, {
                  "type": "ARITH_OP_1",
                  "content": [{
                    "type": "literal",
                    "content": "*",
                    "location": [1, 39]
                  }]
                }, {
                  "type": "FACTOR",
                  "content": [{
                    "type": "BASE",
                    "content": [{
                      "type": "token",
                      "token": "id",
                      "content": "d",
                      "location": [1, 40]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }],
        [{
          "type": "token",
          "token": "id",
          "content": "x",
          "location": [1, 42]
        }, {
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
                      "content": "4",
                      "location": [1, 44]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }]
      ])
    })
  })
  describe('getTermTokensWithinDefinition', () => {
    const definition = getDefinitionMap(parse(tokenize('$key1: a, b, c $key2: d, e, f x=a+b-y y=c*(2-if y then 1 else 2 end) z=1')))
    const x = [...definition.keys()].find(({
      content
    }) => content === 'x')
    const y = [...definition.keys()].find(({
      content
    }) => content === 'y')
    const z = [...definition.keys()].find(({
      content
    }) => content === 'z')
    it('should return the terms within a shallow simple definition', () => {
      assert.deepEqual(getTermTokensWithinDefinition(definition.get(x)), [{
        "type": "token",
        "token": "id",
        "content": "y",
        "location": [1, 36]
      }, {
        "type": "token",
        "token": "id",
        "content": "b",
        "location": [1, 34]
      }, {
        "type": "token",
        "token": "id",
        "content": "a",
        "location": [1, 32]
      }])
    })
    it('should return the terms within a deep complex circular definition', () => {
      assert.deepEqual(getTermTokensWithinDefinition(definition.get(y)), [{
        "type": "token",
        "token": "id",
        "content": "y",
        "location": [1, 48]
      }, {
        "type": "token",
        "token": "id",
        "content": "c",
        "location": [1, 40]
      }])
    })
    it('should return empty for a definition without terms', () => {
      assert.deepEqual(getTermTokensWithinDefinition(definition.get(z)), [])
    })
  })
  describe('isTerminal', () => {
    it('should return false for a non terminal token', () => {
      assert.equal(isTerminal({
        type: 'some type'
      }), false)
    })
    it('should return true for a literal', () => {
      assert.equal(isTerminal({
        type: 'literal'
      }), true)
    })
    it('should return true for a token', () => {
      assert.equal(isTerminal({
        type: 'token'
      }), true)
    })
  })
  describe('getContent', () => {
    it('should return the content of the node', () => {
      assert.equal(getContent({
        content: 'some content'
      }), 'some content')
    })
  })
  describe('getType', () => {
    it('should return the type of the node', () => {
      assert.equal(getType({
        type: 'some type'
      }), 'some type')
    })
  })
  describe('parse', () => {
    it('throws an error when broken definition', () => {
      assert.throws(() => parse(tokenize('a =')), {
        name: 'Error',
        message: `Expected an expression after the "=" symbol. 'End of input' found instead. At end of input`
      })
    })
    it('throws an error when broken sum at end', () => {
      assert.throws(() => parse(tokenize('a = 1 +')), {
        name: 'Error',
        message: `Expected a sumator after the operator. 'End of input' found instead. At end of input`
      })
    })
    it('throws an error when broken factor not at end', () => {
      assert.throws(() => parse(tokenize('a = 1 * + 2 ')), {
        name: 'Error',
        message: `Expected a factor after the operator. '+' found instead. At 1:8`
      })
    })
    it('throws an error when input continues', () => {
      assert.throws(() => parse(tokenize('a = 1 2')), {
        name: 'Error',
        message: 'Unexpected token num (2). Expected end of input. At 1:6'
      })
    })
    it('throws an error on wrong injectable format, no ":"', () => {
      assert.throws(() => parse(tokenize('$a = b')), {
        name: 'Error',
        message: `Expected ":" after injectable name. '=' found instead. At 1:3`
      })
    })
    it('throws an error on wrong injectable format, no term after ":"', () => {
      assert.throws(() => parse(tokenize('$a: 1')), {
        name: 'Error',
        message: `Expected at least one injectable term. '1' found instead. At 1:4`
      })
    })
    it('throws an error on wrong injectable format, no term after ","', () => {
      assert.throws(() => parse(tokenize('$a: b,')), {
        name: 'Error',
        message: `Expected an id after ",". 'End of input' found instead. At end of input`
      })
    })
    it('throws several errors', () => {
      assert.throws(() => parse(tokenize('$a: b, 1 $b = c 2 x: y -')), {
        name: 'Error',
        message: `Expected an id after ",". '1' found instead. At 1:7`
      })
    })
    it('should parse a simple definition', () => {
      assert.deepEqual(parse(tokenize('a = 1')), [{
        "type": "AXIOM",
        "content": [{
          "type": "DEF",
          "content": [{
            "type": "token",
            "token": "id",
            "content": "a",
            "location": [1, 0]
          }, {
            "type": "literal",
            "content": "=",
            "location": [1, 2]
          }, {
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
                        "content": "1",
                        "location": [1, 4]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }]
      }])
    })
    it('should parse correctly every value type', () => {
      assert.deepEqual(parse(tokenize('a = 1 b = true c = false d = 0.1 e = f')), [{
        "type": "AXIOM",
        "content": [{
          "type": "DEF",
          "content": [{
            "type": "token",
            "token": "id",
            "content": "a",
            "location": [1, 0]
          }, {
            "type": "literal",
            "content": "=",
            "location": [1, 2]
          }, {
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
                        "content": "1",
                        "location": [1, 4]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }, {
          "type": "DEF",
          "content": [{
            "type": "token",
            "token": "id",
            "content": "b",
            "location": [1, 6]
          }, {
            "type": "literal",
            "content": "=",
            "location": [1, 8]
          }, {
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
                        "type": "literal",
                        "content": "true",
                        "location": [1, 10]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }, {
          "type": "DEF",
          "content": [{
            "type": "token",
            "token": "id",
            "content": "c",
            "location": [1, 15]
          }, {
            "type": "literal",
            "content": "=",
            "location": [1, 17]
          }, {
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
                        "type": "literal",
                        "content": "false",
                        "location": [1, 19]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }, {
          "type": "DEF",
          "content": [{
            "type": "token",
            "token": "id",
            "content": "d",
            "location": [1, 25]
          }, {
            "type": "literal",
            "content": "=",
            "location": [1, 27]
          }, {
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
                        "content": "0.1",
                        "location": [1, 29]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }, {
          "type": "DEF",
          "content": [{
            "type": "token",
            "token": "id",
            "content": "e",
            "location": [1, 33]
          }, {
            "type": "literal",
            "content": "=",
            "location": [1, 35]
          }, {
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
                        "content": "f",
                        "location": [1, 37]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }]
      }])
    })
    it('should parse a definition with some injectables', () => {
      assert.deepEqual(parse(tokenize('$injectable: a, b c = 1')), [{
        "type": "AXIOM",
        "content": [{
          "type": "INJECTABLE",
          "content": [{
            "type": "literal",
            "content": "$",
            "location": [1, 0]
          }, {
            "type": "token",
            "token": "id",
            "content": "injectable",
            "location": [1, 1]
          }, {
            "type": "literal",
            "content": ":",
            "location": [1, 11]
          }, {
            "type": "token",
            "token": "id",
            "content": "a",
            "location": [1, 13]
          }, {
            "type": "literal",
            "content": ",",
            "location": [1, 14]
          }, {
            "type": "token",
            "token": "id",
            "content": "b",
            "location": [1, 16]
          }]
        }, {
          "type": "DEF",
          "content": [{
            "type": "token",
            "token": "id",
            "content": "c",
            "location": [1, 18]
          }, {
            "type": "literal",
            "content": "=",
            "location": [1, 20]
          }, {
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
                        "content": "1",
                        "location": [1, 22]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }]
      }])
    })
    it('should apply correct associative rules', () => {
      assert.deepEqual(parse(tokenize('a = 0 || 1 + !2 * (-3 / if 4 - -5 then !6 else 7 end && 8 + 9) / 10')), [{
        "type": "AXIOM",
        "content": [{
          "type": "DEF",
          "content": [{
            "type": "token",
            "token": "id",
            "content": "a",
            "location": [1, 0]
          }, {
            "type": "literal",
            "content": "=",
            "location": [1, 2]
          }, {
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
                        "content": "0",
                        "location": [1, 4]
                      }]
                    }]
                  }]
                }]
              }]
            }, {
              "type": "LOGIC_OP",
              "content": [{
                "type": "literal",
                "content": "||",
                "location": [1, 6]
              }]
            }, {
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
                        "content": "1",
                        "location": [1, 9]
                      }]
                    }]
                  }]
                }, {
                  "type": "ARITH_OP_0",
                  "content": [{
                    "type": "literal",
                    "content": "+",
                    "location": [1, 11]
                  }]
                }, {
                  "type": "SUM",
                  "content": [{
                    "type": "FACTOR",
                    "content": [{
                      "type": "UNARY_OP",
                      "content": [{
                        "type": "literal",
                        "content": "!",
                        "location": [1, 13]
                      }]
                    }, {
                      "type": "BASE",
                      "content": [{
                        "type": "token",
                        "token": "num",
                        "content": "2",
                        "location": [1, 14]
                      }]
                    }]
                  }, {
                    "type": "ARITH_OP_1",
                    "content": [{
                      "type": "literal",
                      "content": "*",
                      "location": [1, 16]
                    }]
                  }, {
                    "type": "FACTOR",
                    "content": [{
                      "type": "BASE",
                      "content": [{
                        "type": "literal",
                        "content": "(",
                        "location": [1, 18]
                      }, {
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
                                  "type": "UNARY_OP",
                                  "content": [{
                                    "type": "literal",
                                    "content": "-",
                                    "location": [1, 19]
                                  }]
                                }, {
                                  "type": "BASE",
                                  "content": [{
                                    "type": "token",
                                    "token": "num",
                                    "content": "3",
                                    "location": [1, 20]
                                  }]
                                }]
                              }, {
                                "type": "ARITH_OP_1",
                                "content": [{
                                  "type": "literal",
                                  "content": "/",
                                  "location": [1, 22]
                                }]
                              }, {
                                "type": "FACTOR",
                                "content": [{
                                  "type": "BASE",
                                  "content": [{
                                    "type": "literal",
                                    "content": "if",
                                    "location": [1, 24]
                                  }, {
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
                                                "content": "4",
                                                "location": [1, 27]
                                              }]
                                            }]
                                          }]
                                        }, {
                                          "type": "ARITH_OP_0",
                                          "content": [{
                                            "type": "literal",
                                            "content": "-",
                                            "location": [1, 29]
                                          }]
                                        }, {
                                          "type": "SUM",
                                          "content": [{
                                            "type": "FACTOR",
                                            "content": [{
                                              "type": "UNARY_OP",
                                              "content": [{
                                                "type": "literal",
                                                "content": "-",
                                                "location": [1, 31]
                                              }]
                                            }, {
                                              "type": "BASE",
                                              "content": [{
                                                "type": "token",
                                                "token": "num",
                                                "content": "5",
                                                "location": [1, 32]
                                              }]
                                            }]
                                          }]
                                        }]
                                      }]
                                    }]
                                  }, {
                                    "type": "literal",
                                    "content": "then",
                                    "location": [1, 34]
                                  }, {
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
                                              "type": "UNARY_OP",
                                              "content": [{
                                                "type": "literal",
                                                "content": "!",
                                                "location": [1, 39]
                                              }]
                                            }, {
                                              "type": "BASE",
                                              "content": [{
                                                "type": "token",
                                                "token": "num",
                                                "content": "6",
                                                "location": [1, 40]
                                              }]
                                            }]
                                          }]
                                        }]
                                      }]
                                    }]
                                  }, {
                                    "type": "literal",
                                    "content": "else",
                                    "location": [1, 42]
                                  }, {
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
                                                "content": "7",
                                                "location": [1, 47]
                                              }]
                                            }]
                                          }]
                                        }]
                                      }]
                                    }]
                                  }, {
                                    "type": "literal",
                                    "content": "end",
                                    "location": [1, 49]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }, {
                          "type": "LOGIC_OP",
                          "content": [{
                            "type": "literal",
                            "content": "&&",
                            "location": [1, 53]
                          }]
                        }, {
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
                                    "content": "8",
                                    "location": [1, 56]
                                  }]
                                }]
                              }]
                            }, {
                              "type": "ARITH_OP_0",
                              "content": [{
                                "type": "literal",
                                "content": "+",
                                "location": [1, 58]
                              }]
                            }, {
                              "type": "SUM",
                              "content": [{
                                "type": "FACTOR",
                                "content": [{
                                  "type": "BASE",
                                  "content": [{
                                    "type": "token",
                                    "token": "num",
                                    "content": "9",
                                    "location": [1, 60]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }]
                      }, {
                        "type": "literal",
                        "content": ")",
                        "location": [1, 61]
                      }]
                    }]
                  }, {
                    "type": "ARITH_OP_1",
                    "content": [{
                      "type": "literal",
                      "content": "/",
                      "location": [1, 63]
                    }]
                  }, {
                    "type": "FACTOR",
                    "content": [{
                      "type": "BASE",
                      "content": [{
                        "type": "token",
                        "token": "num",
                        "content": "10",
                        "location": [1, 65]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }]
      }])
    })
  })
})
