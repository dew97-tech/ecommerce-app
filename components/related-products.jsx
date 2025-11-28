import { db } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"

export async function RelatedProducts({ categoryId, currentProductId, limit = 4 }) {
  if (!categoryId) return null

  const relatedProducts = await db.product.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
      stock: { gt: 0 } // Optional: only show in-stock items
    },
    take: limit,
    orderBy: {
      isTrending: 'desc', // Show trending items first
    },
    include: {
      category: true
    }
  })

  if (relatedProducts.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold border-b pb-2">Related Products</h3>
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
                  <span className="font-bold text-primary text-sm">৳{product.price.toLocaleString()}</span>
                  {product.discountedPrice && (
                    <span className="text-xs text-muted-foreground line-through">৳{product.discountedPrice.toLocaleString()}</span>
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
