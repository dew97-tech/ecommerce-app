'use server'

import { db } from "@/lib/db"
import { getFirstImage } from "@/lib/images"
import { getSellingPrice } from "@/lib/price"

export async function getCartItemDetails(ids) {
  const uniqueIds = [...new Set((Array.isArray(ids) ? ids : []).filter(Boolean))]

  if (uniqueIds.length === 0) return []

  const products = await db.product.findMany({
    where: { id: { in: uniqueIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      discountedPrice: true,
      stock: true,
    },
  })

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: getFirstImage(product.images, null),
    price: getSellingPrice(product),
    stock: product.stock,
  }))
}

export async function validateCartLine(productId, requestedQuantity) {
  if (!productId || typeof productId !== "string") return null

  const product = await db.product.findFirst({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      discountedPrice: true,
      stock: true,
      isActive: true,
      availabilityStatus: true,
    },
  })

  if (!product) return null

  const available =
    product.isActive &&
    product.availabilityStatus !== "OUT_OF_STOCK" &&
    product.stock > 0

  const requested = Math.max(1, Number(requestedQuantity) || 1)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: getFirstImage(product.images, null),
    price: getSellingPrice(product),
    stock: product.stock,
    available,
    quantity: available ? Math.min(requested, product.stock) : 0,
  }
}
