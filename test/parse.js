import assert from 'assert'
import {
  tokenize
} from '../src/tokenize.js'
import {
  isTerminal,
  getType,
  getContent,
  parse
} from '../src/parse.js'

describe('parse', () => {
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
    it('should parse a simple definition', () => {
      assert.deepEqual(parse(tokenize('a = 1')), [
        [{
          "type": "AXIOM",
          "content": [{
            "type": "DEF",
            "content": [{
              "type": "token",
              "content": "a"
            }, {
              "type": "literal",
              "content": "="
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
                          "content": "1"
                        }]
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
    it('should parse correctly every value type', () => {
      assert.deepEqual(parse(tokenize('a = 1 b = true c = false d = 0.1 e = f')), [
        [{
          "type": "AXIOM",
          "content": [{
            "type": "DEF",
            "content": [{
              "type": "token",
              "content": "a"
            }, {
              "type": "literal",
              "content": "="
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
                          "content": "1"
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
              "content": "b"
            }, {
              "type": "literal",
              "content": "="
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
                          "content": "true"
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
              "content": "c"
            }, {
              "type": "literal",
              "content": "="
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
                          "content": "false"
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
              "content": "d"
            }, {
              "type": "literal",
              "content": "="
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
                          "content": "0.1"
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
              "content": "e"
            }, {
              "type": "literal",
              "content": "="
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
                          "content": "f"
                        }]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }], 15
      ])
    })
    it('should parse a definition with some injectables', () => {
      assert.deepEqual(parse(tokenize('$injectable = a, b c = 1')), [
        [{
          "type": "AXIOM",
          "content": [{
            "type": "INJECTABLE",
            "content": [{
              "type": "literal",
              "content": "$"
            }, {
              "type": "token",
              "content": "injectable"
            }, {
              "type": "literal",
              "content": "="
            }, {
              "type": "token",
              "content": "a"
            }, {
              "type": "literal",
              "content": ","
            }, {
              "type": "token",
              "content": "b"
            }]
          }, {
            "type": "DEF",
            "content": [{
              "type": "token",
              "content": "c"
            }, {
              "type": "literal",
              "content": "="
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
                          "content": "1"
                        }]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }], 9
      ])
    })
    it('should apply correct associative rules', () => {
      assert.deepEqual(parse(tokenize('a = 0 || 1 + !2 * (-3 / if 4 - -5 then !6 else 7 end && 8 + 9) / 10')), [
        [{
          "type": "AXIOM",
          "content": [{
            "type": "DEF",
            "content": [{
              "type": "token",
              "content": "a"
            }, {
              "type": "literal",
              "content": "="
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
                          "content": "0"
                        }]
                      }]
                    }]
                  }]
                }]
              }, {
                "type": "LOGIC_OP",
                "content": [{
                  "type": "literal",
                  "content": "||"
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
                          "content": "1"
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
                        "type": "UNARY_OP",
                        "content": [{
                          "type": "literal",
                          "content": "!"
                        }]
                      }, {
                        "type": "BASE",
                        "content": [{
                          "type": "token",
                          "content": "2"
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
                          "type": "literal",
                          "content": "("
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
                                      "content": "-"
                                    }]
                                  }, {
                                    "type": "BASE",
                                    "content": [{
                                      "type": "token",
                                      "content": "3"
                                    }]
                                  }]
                                }, {
                                  "type": "ARITH_OP_1",
                                  "content": [{
                                    "type": "literal",
                                    "content": "/"
                                  }]
                                }, {
                                  "type": "FACTOR",
                                  "content": [{
                                    "type": "BASE",
                                    "content": [{
                                      "type": "literal",
                                      "content": "if"
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
                                                  "content": "4"
                                                }]
                                              }]
                                            }]
                                          }, {
                                            "type": "ARITH_OP_0",
                                            "content": [{
                                              "type": "literal",
                                              "content": "-"
                                            }]
                                          }, {
                                            "type": "SUM",
                                            "content": [{
                                              "type": "FACTOR",
                                              "content": [{
                                                "type": "UNARY_OP",
                                                "content": [{
                                                  "type": "literal",
                                                  "content": "-"
                                                }]
                                              }, {
                                                "type": "BASE",
                                                "content": [{
                                                  "type": "token",
                                                  "content": "5"
                                                }]
                                              }]
                                            }]
                                          }]
                                        }]
                                      }]
                                    }, {
                                      "type": "literal",
                                      "content": "then"
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
                                                  "content": "!"
                                                }]
                                              }, {
                                                "type": "BASE",
                                                "content": [{
                                                  "type": "token",
                                                  "content": "6"
                                                }]
                                              }]
                                            }]
                                          }]
                                        }]
                                      }]
                                    }, {
                                      "type": "literal",
                                      "content": "else"
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
                                                  "content": "7"
                                                }]
                                              }]
                                            }]
                                          }]
                                        }]
                                      }]
                                    }, {
                                      "type": "literal",
                                      "content": "end"
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          }, {
                            "type": "LOGIC_OP",
                            "content": [{
                              "type": "literal",
                              "content": "&&"
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
                                      "content": "8"
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
                                      "content": "9"
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }, {
                          "type": "literal",
                          "content": ")"
                        }]
                      }]
                    }, {
                      "type": "ARITH_OP_1",
                      "content": [{
                        "type": "literal",
                        "content": "/"
                      }]
                    }, {
                      "type": "FACTOR",
                      "content": [{
                        "type": "BASE",
                        "content": [{
                          "type": "token",
                          "content": "10"
                        }]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }], 31
      ])
    })
  })
})
