import { ProductDetails } from "@/components/product-details"
import { AddReviewForm } from "@/components/reviews/add-review-form"
import { ReviewList } from "@/components/reviews/review-list"
import { StarRating } from "@/components/reviews/star-rating"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db"
import Image from "next/image"
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

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
             <Image
               src={images[0] || "/placeholder.png"}
               alt={product.name}
               fill
               className="object-cover"
             />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {images.slice(1).map((img, i) => (
              <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <ProductDetails product={product} />
      </div>

      <Separator className="my-12" />

      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} />
            <span className="text-muted-foreground">
              ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        <AddReviewForm productId={product.id} />
        
        <div className="mt-8">
          <ReviewList reviews={product.reviews} />
        </div>
      </div>
    </div>
  )
}
