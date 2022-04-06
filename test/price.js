import assert from 'assert'
import {
  price
} from '../src/price.js'

describe('price', () => {
  it('evaluates a few terms', () => {
    const priceable = {
      items: [{
        name: 'item1',
        schema: 'pd1'
      }]
    }
    const injectable = {
      injected_value_1: 3,
      injected_condition: true,
      injected_value_2: 5.2
    }
    assert.deepEqual(price(priceable, ['total', 'value_a', 'value_b'], injectable), {
      item1: {
        total: 11.8,
        value_a: 2.2,
        value_b: 5.2
      }
    })
  })
})
