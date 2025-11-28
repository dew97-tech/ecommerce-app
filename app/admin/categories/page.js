import { AdminPagination } from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { CategoriesTable } from "@/components/admin/categories-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { FolderOpen, Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function CategoriesPage(props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const itemsPerPage = 10
  const skip = (currentPage - 1) * itemsPerPage

  const where = query ? {
    OR: [
      { name: { contains: query } },
      { slug: { contains: query } }
    ]
  } : {}

  const [categories, totalCount] = await Promise.all([
    db.category.findMany({
      where,
      orderBy: { name: 'asc' },
      take: itemsPerPage,
      skip,
      include: { _count: { select: { products: true } } }
    }),
    db.category.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Categories</h2>
          <p className="text-muted-foreground mt-1">Organize your products into categories</p>
        </div>
        <Link href="/admin/categories/new">
          <Button size="lg" className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" /> Add New Category
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            All Categories
          </CardTitle>
          <AdminSearch placeholder="Search categories..." />
        </CardHeader>
        <CardContent>
          <CategoriesTable categories={categories} />
          
          <div className="mt-4">
              <AdminPagination totalPages={totalPages} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
