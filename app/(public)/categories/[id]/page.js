import { FadeIn } from "@/components/animations/fade-in"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params, searchParams }) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  
  const category = await db.category.findUnique({
    where: { id }
  })

  if (!category) {
    notFound()
  }

  const page = Number(resolvedSearchParams.page) || 1
  const limit = 12
  const skip = (page - 1) * limit

  const search = resolvedSearchParams.search
  const sort = resolvedSearchParams.sort || 'newest'

  const where = { categoryId: id }
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

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      <FadeIn>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{category.icon || '📦'}</span>
            <div>
              <h1 className="text-4xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground mt-2">{category.description}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {products.length} of {totalCount} products
          </p>
        </div>
      </FadeIn>

      <ProductFilters 
        currentCategory={id}
        hideCategories={true}
      />

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No products found in this category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product, index) => (
              <FadeIn key={product.id} delay={index * 0.05}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href={`?page=${Math.max(1, page - 1)}${search ? `&search=${search}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}`}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href={`?page=${i + 1}${search ? `&search=${search}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}`}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    href={`?page=${Math.min(totalPages, page + 1)}${search ? `&search=${search}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}`}
                    aria-disabled={page >= totalPages}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}
