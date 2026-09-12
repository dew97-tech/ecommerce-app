'use server'

import { db } from "@/lib/db"
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/config"
import { buildSearchWhere } from "@/lib/search-query"
import { unstable_cache } from "next/cache"

const loadSuggestions = unstable_cache(
  async (normalizedQuery) => {
    const products = await db.product.findMany({
      where: {
        isActive: true,
        availabilityStatus: "IN_STOCK",
        ...(buildSearchWhere(normalizedQuery, ['name', 'brand']) ?? {})
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
  },
  ["search-suggestions"],
  {
    tags: [CACHE_TAGS.products],
    revalidate: CACHE_TTL.listing,
  }
)

export async function getSuggestions(query) {
  if (!query) {
    return []
  }

  const normalized = query.trim().toLowerCase().slice(0, 64)
  if (normalized.length < 2) {
    return []
  }

  try {
    return await loadSuggestions(normalized)
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}
