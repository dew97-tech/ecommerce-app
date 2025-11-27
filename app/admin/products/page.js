import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteProduct } from "@/lib/admin-actions"
import { db } from "@/lib/db"
import { Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </Link>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>৳ {product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <form action={deleteProduct.bind(null, product.id)}>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
