import fs from 'fs'
import { parse } from './parse.js'
import { tokenize } from './tokenize.js'
import { validate } from './validate.js'
import { evaluate } from './evaluate.js'

const pd = {
  pd1: fs.readFileSync('./static/pricing_document_1', { encoding:'utf8', flag:'r' })
}

const priceItem = (priceableItem, terms, hash) => {
  const schema = priceableItem.schema
  const doc = pd[schema]
  const parsed = parse(tokenize(doc))
  console.log(validate(parsed))
  return terms.reduce((acc, term) => ({ ...acc, [term]: evaluate(parsed, term, hash) }), {})
}

export const price = (priceable, terms, hash) => {
  return priceable.items.reduce((acc, item) => ({...acc, [item.name]: priceItem(item, terms, hash)}), {})
}
