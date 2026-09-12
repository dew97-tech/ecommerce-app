export function getSellingPrice(product) {
  if (!product) return 0
  return product.discountedPrice ?? product.price
}

export function getOriginalPrice(product) {
  if (!product) return 0
  return product.price
}

export function getDiscountPercentage(product) {
  const selling = getSellingPrice(product)
  const original = getOriginalPrice(product)
  if (!original || selling >= original) return 0
  return Math.round(((original - selling) / original) * 100)
}
