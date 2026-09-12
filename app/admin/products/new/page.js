import { ProductForm } from "@/components/admin/product-form"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const categories = await db.category.findMany()
  return <ProductForm categories={categories} />
}
