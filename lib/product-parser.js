

function parsePythonLiteral(input) {
  const s = String(input)
  let i = 0

  const skipWs = () => {
    while (i < s.length && /\s/.test(s[i])) i++
  }

  const parseString = (quote) => {
    i++
    let out = ''
    while (i < s.length) {
      const ch = s[i]
      if (ch === '\\') {
        const next = s[i + 1]
        if (next === 'n') out += '\n'
        else if (next === 'r') out += '\r'
        else if (next === 't') out += '\t'
        else if (next === '\\') out += '\\'
        else if (next === "'") out += "'"
        else if (next === '"') out += '"'
        else if (next === 'x') {
          out += String.fromCharCode(parseInt(s.substr(i + 2, 2), 16))
          i += 2
        } else if (next === 'u') {
          out += String.fromCharCode(parseInt(s.substr(i + 2, 4), 16))
          i += 4
        } else {
          out += next
        }
        i += 2
        continue
      }
      if (ch === quote) {
        i++
        return out
      }
      out += ch
      i++
    }
    throw new Error('Unterminated string')
  }

  const parseValue = () => {
    skipWs()
    const ch = s[i]
    if (ch === '{') return parseDict()
    if (ch === '[') return parseList(']')
    if (ch === '(') return parseList(')')
    if (ch === "'" || ch === '"') return parseString(ch)
    if (s.startsWith('True', i)) {
      i += 4
      return true
    }
    if (s.startsWith('False', i)) {
      i += 5
      return false
    }
    if (s.startsWith('None', i)) {
      i += 4
      return null
    }
    const match = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(s.slice(i))
    if (match) {
      i += match[0].length
      return Number(match[0])
    }
    throw new Error(`Unexpected token at ${i}`)
  }

  const parseDict = () => {
    i++
    const obj = {}
    skipWs()
    if (s[i] === '}') {
      i++
      return obj
    }
    while (i < s.length) {
      const key = parseValue()
      skipWs()
      if (s[i] !== ':') throw new Error('Expected ":"')
      i++
      obj[String(key)] = parseValue()
      skipWs()
      if (s[i] === ',') {
        i++
        skipWs()
        if (s[i] === '}') {
          i++
          return obj
        }
        continue
      }
      if (s[i] === '}') {
        i++
        return obj
      }
      throw new Error('Expected "," or "}"')
    }
    throw new Error('Unterminated dict')
  }

  const parseList = (close) => {
    i++
    const arr = []
    skipWs()
    if (s[i] === close) {
      i++
      return arr
    }
    while (i < s.length) {
      arr.push(parseValue())
      skipWs()
      if (s[i] === ',') {
        i++
        skipWs()
        if (s[i] === close) {
          i++
          return arr
        }
        continue
      }
      if (s[i] === close) {
        i++
        return arr
      }
      throw new Error(`Expected "," or "${close}"`)
    }
    throw new Error('Unterminated list')
  }

  const result = parseValue()
  skipWs()
  if (i < s.length) throw new Error('Trailing content after literal')
  return result
}

export function parseProductData(data) {
  if (!data) return null

  if (typeof data === 'object') {
    return data
  }

  try {
    return JSON.parse(data)
  } catch (error) {

  }

  try {
    return parsePythonLiteral(data)
  } catch (error) {

    return data
  }
}
