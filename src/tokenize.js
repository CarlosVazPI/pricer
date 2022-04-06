const regexps = {
  ws: /\s+/,
  id: /[a-zA-Z_][a-zA-z0-9_]*/,
  num: /[0-9]+(\.[0-9]+)?/,
  symbol: /\,|\$|\+|\-|\*|\/|==?|<=?|>=?|!=?|\(|\)|&&?|\|\|?/
}

export const tokenize = inputString => {
  const location = [1, 0]
  const tokens = []
  while (inputString.length) {
    const token = Object.keys(regexps).find(key => inputString.match(regexps[key])?.index === 0)
    if (!token) throw new Error(`Cannot split input, in '${inputString.slice(0, 32)}...', at ${location.join(':')}`)
    const value = inputString.match(regexps[token])[0]
    inputString = inputString.slice(value.length)
    if (token !== 'ws') {
      tokens.push({ token, value, location: [...location] })
    }
    const rows = value.split('\n')
    location[0] += rows.length - 1
    location[1] = rows.length > 1 ? rows[rows.length - 1].length : location[1] + rows[0].length
  }
  return tokens
}
