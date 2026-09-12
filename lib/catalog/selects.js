export const PRODUCT_CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  discountedPrice: true,
  stock: true,
  images: true,
  brand: true,
  isTrending: true,
  availabilityStatus: true,
  category: { select: { name: true } },
}
