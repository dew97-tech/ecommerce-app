'use server'

import { db } from "@/lib/db"

export async function getSuggestions(query) {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: query } }, // Case-insensitive by default in many DBs, or use mode: 'insensitive' if Postgres
          { brand: { contains: query } }
        ]
      },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountedPrice: true,
        images: true,
        brand: true,
        category: {
            select: { name: true }
        }
      }
    })

    // Clean up images similar to layout.js
    return products.map(product => {
        let firstImage = ''
        if (product.images) {
            try {
                const parsed = JSON.parse(product.images)
                if (Array.isArray(parsed)) firstImage = parsed[0]
                else firstImage = product.images.split(',')[0]
            } catch (e) {
                const clean = product.images.replace(/[\[\]"]/g, '')
                firstImage = clean.split(',')[0]
            }
        }
        return { ...product, image: firstImage }
    })
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}
