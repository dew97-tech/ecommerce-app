import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const limit = 12
  const skip = (page - 1) * limit

  const categoryId = resolvedSearchParams.category
  const search = resolvedSearchParams.search
  const sort = resolvedSearchParams.sort || 'newest'

  const where = {}
  if (categoryId && categoryId !== 'all') where.categoryId = categoryId
  if (search) where.name = { contains: search }

  let orderBy = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  if (sort === 'price_desc') orderBy = { price: 'desc' }

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  const categories = await db.category.findMany()
  const totalPages = Math.ceil(totalCount / limit)

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">All Products</h1>
          <p className="text-muted-foreground">Discover our complete collection</p>
        </div>
        
        <ProductFilters categories={categories} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href={`?${new URLSearchParams({ ...resolvedSearchParams, page: Math.max(1, page - 1) }).toString()}`}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((p, i) => (
                  <PaginationItem key={i}>
                    {p === '...' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink 
                        href={`?${new URLSearchParams({ ...resolvedSearchParams, page: p }).toString()}`}
                        isActive={page === p}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    href={`?${new URLSearchParams({ ...resolvedSearchParams, page: Math.min(totalPages, page + 1) }).toString()}`}
                    aria-disabled={page >= totalPages}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
