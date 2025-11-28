import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCategory } from "@/lib/admin-category-actions"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

export default function NewCategoryPage() {
  return (
    <div className="p-8 pt-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/categories">Categories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex items-center gap-4">
          <Link href="/admin/categories">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Category</h2>
            <p className="text-muted-foreground">Create a new category for your products</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Category Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">Category Name</Label>
              <Input id="name" name="name" placeholder="e.g. Laptops" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="font-semibold">Image URL (Optional)</Label>
              <Input id="image" name="image" placeholder="https://..." className="h-11" />
              <p className="text-xs text-muted-foreground">Provide a direct link to an image for this category.</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="isFeatured" name="isFeatured" />
              <Label htmlFor="isFeatured">Featured Category</Label>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Link href="/admin/categories" className="flex-1">
                <Button variant="outline" className="w-full h-11" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1 h-11 shadow-lg">
                Create Category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
