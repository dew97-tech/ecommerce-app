import { ProductForm } from "@/components/admin/product-form"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const categories = await db.category.findMany()
  return (
    <div className="p-8 pt-6">
      <div className="max-w-2xl mx-auto">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
