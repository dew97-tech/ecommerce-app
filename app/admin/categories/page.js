import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { CategoriesTable } from "@/components/admin/categories-table"
import { CategoryParentFilter } from "@/components/admin/category-parent-filter"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { buildSearchWhere } from "@/lib/search-query"
import { FolderTree, Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function CategoriesPage(props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const parentFilter = searchParams?.parent || 'all'
  const currentPage = Math.max(1, Number(searchParams?.page) || 1)
  const itemsPerPage = 12
  const skip = (currentPage - 1) * itemsPerPage

  const searchWhere = buildSearchWhere(query, ['name', 'slug'])

  const where = {
    ...(searchWhere ?? {}),
    ...(parentFilter === 'roots'
      ? { parentId: null }
      : parentFilter !== 'all'
        ? { parentId: parentFilter }
        : {}),
  }

  const [categories, totalCount, roots] = await Promise.all([
    db.category.findMany({
      where,
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
      take: itemsPerPage,
      skip,
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
    }),
    db.category.count({ where }),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Categories"
        description="Organize the catalog and keep duplicate subcategories under control."
        actions={
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4" />
              Add category
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FolderTree className="h-4 w-4 text-primary" />
            All categories
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {totalCount.toLocaleString('en-US')}
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <CategoryParentFilter roots={roots} value={parentFilter} />
            <AdminSearch placeholder="Search categories..." />
          </div>
        </div>

        <div className="p-4">
          <CategoriesTable categories={categories} />

          <div className="mt-4">
            <AdminPagination totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  )
}
