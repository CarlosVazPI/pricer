import assert from 'assert'
import { price } from '../src/price.js'

describe('price', () => {
  it('evaluates a few terms', () => {
    const priceable = { schema: 'pd1'}
    const injectable = {
      injected_value_1: 3,
      injected_condition: true,
      injected_value_2: 5.2
    }
    assert.deepEqual(price(priceable, injectable, ['total', 'value_a', 'value_b']), [11.8, 2.2, 5.2])
  })
})
