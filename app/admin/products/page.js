import { AdminPagination } from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteProduct } from "@/lib/admin-actions"
import { db } from "@/lib/db"
import { Edit, Package, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ProductsPage(props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const itemsPerPage = 10
  const skip = (currentPage - 1) * itemsPerPage

  const where = query ? {
    OR: [
      { name: { contains: query } },
      { productCode: { contains: query } },
      { brand: { contains: query } }
    ]
  } : {}

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: itemsPerPage,
      skip,
    }),
    db.product.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Products</h2>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button size="lg" className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>
      
      <div className="rounded-md border bg-card">
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Products
          </h3>
          <AdminSearch placeholder="Search products..." />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Product Name</TableHead>
              <TableHead className="font-semibold">Price</TableHead>
              <TableHead className="font-semibold">Stock</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                      <div className="flex flex-col">
                          <span>{product.name}</span>
                          {product.productCode && <span className="text-xs text-muted-foreground">{product.productCode}</span>}
                      </div>
                  </TableCell>
                  <TableCell className="font-semibold">৳{product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 0 ? "outline" : "destructive"} className={product.stock > 0 ? "bg-green-50 text-green-700 border-green-200" : ""}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteProduct.bind(null, product.id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="p-4 border-t">
          <AdminPagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}
