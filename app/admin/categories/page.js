import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createCategory, deleteCategory } from "@/lib/admin-category-actions"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } }
  })

  return (
    <div className="p-8 pt-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category._count.products}</TableCell>
                    <TableCell className="text-right">
                      <form action={deleteCategory.bind(null, category.id)}>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="e.g. Laptops" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL (Optional)</Label>
                <Input id="image" name="image" placeholder="https://..." />
              </div>
              <Button type="submit" className="w-full">Create Category</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
