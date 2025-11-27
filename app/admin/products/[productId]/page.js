import { ProductForm } from "@/components/admin/product-form"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }) {
  const { productId } = await params
  const product = await db.product.findUnique({
    where: { id: productId },
  })
  const categories = await db.category.findMany()

  if (!product) {
    notFound()
  }

  return (
    <div className="p-8 pt-6">
      <div className="max-w-2xl mx-auto">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  )
}
