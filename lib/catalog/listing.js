import { db } from "@/lib/db"
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/config"
import { PRODUCT_CARD_SELECT } from "@/lib/catalog/selects"
import { unstable_cache } from "next/cache"

const loadListing = unstable_cache(
  async ({ where, orderBy, skip, take, select }) => {
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take,
        select,
      }),
      db.product.count({ where }),
    ])

    return { products, totalCount }
  },
  ["product-listing"],
  {
    tags: [CACHE_TAGS.products],
    revalidate: CACHE_TTL.listing,
  }
)

export function getListingResults({ where, orderBy, skip, take, select }) {
  return loadListing({
    where,
    orderBy,
    skip,
    take,
    select: select ?? PRODUCT_CARD_SELECT,
  })
}
