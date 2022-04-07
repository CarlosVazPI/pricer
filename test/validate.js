import assert from 'assert'
import {
  tokenize
} from '../src/tokenize.js'
import {
  parse
} from '../src/parse.js'
import {
  validate
} from '../src/validate.js'


describe('validate', () => {
  it('should detect no errors for well formed input', () => {
    assert.deepEqual(validate(parse(tokenize('$key1: a, b $key2: c x=a+b-y y=c*(2-if z then 1 else 2 end) z=1'))), [])
  })
  it('should detect unused injectables', () => {
    assert.deepEqual(validate(parse(tokenize('$key1: a, b $key2: c, d x=a+b-y y=c*(2-if z then 1 else 2 end) z=1'))), [{
      "location": [1, 22],
      "severity": "warning",
      "message": "Injectable 'd' is unused. At 1:22"
    }])
  })
  it('should detect duplicated injectables', () => {
    assert.deepEqual(validate(parse(tokenize('$key1: a, b $key2: c, a x=a+b-y y=c*(2-if z then 1 else 2 end) z=1'))), [{
      "location": [1, 7],
      "severity": "error",
      "message": "Injectable 'a' is declared several times. At 1:7"
    }, {
      "location": [1, 22],
      "severity": "error",
      "message": "Injectable 'a' is declared several times. At 1:22"
    }])
  })
  it('should detect duplicated definitions', () => {
    assert.deepEqual(validate(parse(tokenize('$key1: a, b $key2: c x=2 x=a+b-y y=c*(2-if z then 1 else 2 end) z=1'))), [{
      "location": [1, 21],
      "severity": "error",
      "message": "Term 'x' is declared several times. At 1:21"
    }, {
      "location": [1, 25],
      "severity": "error",
      "message": "Term 'x' is declared several times. At 1:25"
    }])
  })
  it('should detect terms not defined', () => {
    assert.deepEqual(validate(parse(tokenize('$key1: a, b $key2: c x=a+b-y y=c*(2-if z then 1 else 2 end) z=t'))), [{
      "location": [1, 21],
      "severity": "error",
      "message": "Term 'x' is not fully defined. At 1:21"
    }, {
      "location": [1, 29],
      "severity": "error",
      "message": "Term 'y' is not fully defined. At 1:29"
    }, {
      "location": [1, 60],
      "severity": "error",
      "message": "Term 'z' is not fully defined. At 1:60"
    }, {
      "location": [1, 62],
      "severity": "error",
      "message": "Term 't' is not declared. At 1:62"
    }])
  })
  it('should detect circular definitions', () => {
    assert.deepEqual(validate(parse(tokenize('$key1: a, b $key2: c x=a+b-y y=c*(2-if z then y else 2 end) z=1'))), [{
      "location": [1, 21],
      "severity": "error",
      "message": "Term 'x' is not fully defined. At 1:21"
    }, {
      "location": [1, 29],
      "severity": "error",
      "message": "Term 'y' has a circular definition. At 1:29"
    }])
  })
  it('should detect unused injectables, nondeclared terms, duplicated injectables and definitions, circular definitions', () => {
    assert.deepEqual(validate(parse(tokenize('$key1: a, b $key2: c, a, d x=2 x=a+b-y y=c*(2-if z then y else 2 end) z=t'))), [{
      "location": [1, 7],
      "severity": "error",
      "message": "Injectable 'a' is declared several times. At 1:7"
    }, {
      "location": [1, 22],
      "severity": "error",
      "message": "Injectable 'a' is declared several times. At 1:22"
    }, {
      "location": [1, 25],
      "severity": "warning",
      "message": "Injectable 'd' is unused. At 1:25"
    }, {
      "location": [1, 27],
      "severity": "error",
      "message": "Term 'x' is declared several times. At 1:27"
    }, {
      "location": [1, 31],
      "severity": "error",
      "message": "Term 'x' is declared several times. At 1:31"
    }, {
      "location": [1, 31],
      "severity": "error",
      "message": "Term 'x' is not fully defined. At 1:31"
    }, {
      "location": [1, 39],
      "severity": "error",
      "message": "Term 'y' has a circular definition. At 1:39"
    }, {
      "location": [1, 70],
      "severity": "error",
      "message": "Term 'z' is not fully defined. At 1:70"
    }, {
      "location": [1, 72],
      "severity": "error",
      "message": "Term 't' is not declared. At 1:72"
    }])
  })
})
