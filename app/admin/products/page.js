import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { EmptyState } from "@/components/admin/empty-state"
import { ProductDeleteButton } from "@/components/admin/product-delete-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/db"
import { parseImages } from "@/lib/images"
import { getDiscountPercentage, getSellingPrice } from "@/lib/price"
import { buildSearchWhere } from "@/lib/search-query"
import { cn } from "@/lib/utils"
import { Edit, Package, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'low-stock', label: 'Low stock' },
  { key: 'archived', label: 'Archived' },
]

function buildFilterHref(filter, searchParams) {
  const params = new URLSearchParams(searchParams)
  params.set('page', '1')

  if (filter === 'all') {
    params.delete('filter')
  } else {
    params.set('filter', filter)
  }

  return `/admin/products?${params.toString()}`
}

export default async function ProductsPage(props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const filter = ['low-stock', 'archived'].includes(searchParams?.filter)
    ? searchParams.filter
    : 'all'
  const currentPage = Math.max(1, Number(searchParams?.page) || 1)
  const itemsPerPage = 12
  const skip = (currentPage - 1) * itemsPerPage

  const and = []

  const searchWhere = buildSearchWhere(query)
  if (searchWhere) {
    and.push(searchWhere)
  }

  if (filter === 'low-stock') {
    and.push({ isActive: true, stock: { lte: 5 } })
  } else if (filter === 'archived') {
    and.push({ isActive: false })
  }

  const where = and.length > 0 ? { AND: and } : {}

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy:
        filter === 'low-stock'
          ? { stock: 'asc' }
          : { createdAt: 'desc' },
      take: itemsPerPage,
      skip,
    }),
    db.product.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Products"
        description="Manage pricing, stock and catalog visibility."
        actions={
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              Add product
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1">
            {FILTERS.map((entry) => (
              <Link
                key={entry.key}
                href={buildFilterHref(entry.key, searchParams)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  filter === entry.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {entry.label}
              </Link>
            ))}
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {totalCount.toLocaleString('en-US')}
            </span>
          </div>

          <AdminSearch placeholder="Search products..." />
        </div>

        <div className="p-0">
          {products.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Package}
                title="No products found"
                description="Try a different filter or add a new product."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const sellingPrice = getSellingPrice(product)
                  const discount = getDiscountPercentage(product)
                  const lowStock = product.isActive && product.stock <= 5

                  return (
                    <TableRow key={product.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-white">
                            <Image
                              src={parseImages(product.images)[0] || '/placeholder.png'}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[320px] truncate text-sm font-medium text-foreground">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.productCode || '—'}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {product.category?.name || 'Uncategorized'}
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-semibold text-price">
                          ৳{sellingPrice.toLocaleString('en-US')}
                        </span>
                        {discount > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground line-through">
                            ৳{product.price.toLocaleString('en-US')}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-semibold',
                            lowStock
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {product.stock} in stock
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge variant={product.isActive ? 'success' : 'secondary'}>
                          {product.isActive ? 'Active' : 'Archived'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-primary"
                          >
                            <Link
                              href={`/admin/products/${product.id}`}
                              aria-label={`Edit ${product.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <ProductDeleteButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="border-t border-border p-4">
          <AdminPagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}
