import fs from 'fs'
import { evaluate } from './evaluate.js'

const pd = {
  pd1: fs.readFileSync('./static/pricing_document_1', { encoding:'utf8', flag:'r' })
}

export const price = (priceable, hash, terms) => {
  const schema = priceable.schema
  const doc = pd[schema]
  return terms.map(evaluate(doc, hash))
}
