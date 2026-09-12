import { unstable_cache } from "next/cache"
import { db } from "@/lib/db"
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config"
import { getDiscountPercentage, getSellingPrice } from "@/lib/price"
import Image from "next/image"
import Link from "next/link"

const loadRelatedProducts = unstable_cache(
  async (categoryId, currentProductId, limit) =>
    db.product.findMany({
      where: {
        categoryId,
        id: { not: currentProductId },
        isActive: true,
        availabilityStatus: "IN_STOCK"
      },
      take: limit,
      orderBy: {
        isTrending: 'desc', 
      },
      include: {
        category: true
      }
    }),
  ["related-products"],
  {
    tags: [CACHE_TAGS.products],
    revalidate: staggeredTtl(CACHE_TTL.product),
  }
)

export async function RelatedProducts({ categoryId, currentProductId, limit = 4 }) {
  if (!categoryId) return null

  const relatedProducts = await loadRelatedProducts(categoryId, currentProductId, limit)

  if (relatedProducts.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex h-12 items-center border-b border-border">
        <h3 className="text-xl font-bold">Related Products</h3>
      </div>
      <div className="flex flex-col gap-4">
        {relatedProducts.map((product) => {
           let displayImage = "/placeholder.png"
           if (product.images) {
             try {
               const images = JSON.parse(product.images)
               if (Array.isArray(images) && images.length > 0) {
                 displayImage = images[0]
               }
             } catch (e) {
               displayImage = product.images.split(',')[0]
             }
           }
           if (displayImage && !displayImage.startsWith('http') && !displayImage.startsWith('/')) {
               displayImage = `/${displayImage}`
           }

           return (
            <Link key={product.id} href={`/products/${product.slug}`} className="group flex gap-3 items-start p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-white border border-border/50">
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  className="object-contain p-1 transition-transform group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-bold text-price text-sm">৳{getSellingPrice(product).toLocaleString('en-US')}</span>
                  {getDiscountPercentage(product) > 0 && (
                    <span className="text-xs text-muted-foreground line-through">৳{product.price.toLocaleString('en-US')}</span>
                  )}
                </div>
              </div>
            </Link>
           )
        })}
      </div>
    </div>
  )
}
