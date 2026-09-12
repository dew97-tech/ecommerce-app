import { ProductForm } from "@/components/admin/product-form"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }) {
  const { productId } = await params
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  })
  const categories = await db.category.findMany()

  if (!product) {
    notFound()
  }

  return <ProductForm product={product} categories={categories} />
}
