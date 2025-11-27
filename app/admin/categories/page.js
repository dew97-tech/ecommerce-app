import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createCategory, deleteCategory } from "@/lib/admin-category-actions"
import { db } from "@/lib/db"
import { FolderOpen, Plus, Trash2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } }
  })

  return (
    <div className="p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Categories</h2>
          <p className="text-muted-foreground mt-1">Organize your products into categories</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              All Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Slug</TableHead>
                  <TableHead className="font-semibold">Products</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No categories found. Create your first category!
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category._count.products} products</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <form action={deleteCategory.bind(null, category.id)}>
                          <Button variant="destructive" size="sm" className="gap-2">
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add New Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCategory} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">Category Name</Label>
                <Input id="name" name="name" placeholder="e.g. Laptops" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image" className="font-semibold">Image URL (Optional)</Label>
                <Input id="image" name="image" placeholder="https://..." className="h-11" />
              </div>
              <Button type="submit" className="w-full h-11 shadow-lg" size="lg">
                <Plus className="mr-2 h-4 w-4" /> Create Category
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
