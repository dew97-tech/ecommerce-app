import { ProductDetails } from "@/components/product-details"
import { ProductImages } from "@/components/product-images"
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
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="space-y-4">
          <ProductImages images={images} productName={product.name} />
        </div>

        <ProductDetails product={product} />
      </div>
    </div>
  )
}
