export const PRODUCT_SEARCH_FIELDS = ['name', 'productCode', 'brand']

const MAX_SEARCH_TOKENS = 8
const MAX_TOKEN_LENGTH = 40

export function tokenizeSearchQuery(query) {
  const normalized = String(query ?? '')
    .slice(0, 200)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

  if (!normalized) return []

  const tokens = []
  for (const word of normalized.split(/\s+/)) {
    const parts = word.match(/[\p{L}]+|\d+/gu)
    if (parts) {
      tokens.push(...parts.map((part) => part.slice(0, MAX_TOKEN_LENGTH)))
    }
  }

  return [...new Set(tokens)].slice(0, MAX_SEARCH_TOKENS)
}

export function buildSearchWhere(query, fields = PRODUCT_SEARCH_FIELDS) {
  const tokens = tokenizeSearchQuery(query)
  if (tokens.length === 0) return null

  return {
    AND: tokens.map((token) => ({
      OR: fields.map((field) => ({ [field]: { contains: token } })),
    })),
  }
}
