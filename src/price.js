import fs from 'fs'
import { evaluate } from './evaluate.js'

const pd = {
  pd1: fs.readFileSync('./static/pricing_document_1', { encoding:'utf8', flag:'r' })
}

export const priceItem = (priceableItem, hash, terms) => {
  const schema = priceableItem.schema
  const doc = pd[schema]
  return terms.map(evaluate(doc, hash))
}

export const price = (priceable, hash, terms) => {
  return priceable.items.map(item => priceItem(item, hash, terms))
}
