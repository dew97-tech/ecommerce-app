export const PRODUCT_SEARCH_FIELDS = ['name', 'productCode', 'brand']

export function tokenizeSearchQuery(query) {
  const normalized = String(query ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

  if (!normalized) return []

  const tokens = []
  for (const word of normalized.split(/\s+/)) {
    const parts = word.match(/[\p{L}]+|\d+/gu)
    if (parts) tokens.push(...parts)
  }

  return [...new Set(tokens)]
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
