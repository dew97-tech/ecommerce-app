import { ProductDetails } from "@/components/product-details"
import { ProductImages } from "@/components/product-images"
import { ProductTabs } from "@/components/product-tabs"
import { RelatedProducts } from "@/components/related-products"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: { 
      category: true, 
      variants: true,
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    },
  })

  if (!product) {
    notFound()
  }

  let images = []
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images)
      if (Array.isArray(parsed)) {
        images = parsed
      }
    } catch (e) {
      images = product.images.split(',')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Section: Images + Info */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <ProductImages images={images} productName={product.name} />
        </div>

        <ProductDetails product={product} />
      </div>

      {/* Bottom Section: Tabs + Sidebar */}
      <div className="grid md:grid-cols-12 gap-8">
         {/* Left Column: Tabs (8 cols) */}
         <div className="md:col-span-9">
            <ProductTabs product={product} />
         </div>

         {/* Right Column: Related Products (4 cols) */}
         <div className="md:col-span-3">
            <div className="sticky top-24">
              <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} limit={5} />
            </div>
         </div>
      </div>
    </div>
  )
}
