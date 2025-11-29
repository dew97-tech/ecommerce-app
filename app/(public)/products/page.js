import { ProductCard } from "@/components/product-card"
import { ProductSidebar } from "@/components/products/product-sidebar"
import { ProductToolbar } from "@/components/products/product-toolbar"
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
  const limit = Number(resolvedSearchParams.limit) || 12
  const skip = (page - 1) * limit

  const categoryId = resolvedSearchParams.category
  const search = resolvedSearchParams.search
  const sort = resolvedSearchParams.sort || 'newest'
  const minPrice = Number(resolvedSearchParams.min_price)
  const maxPrice = Number(resolvedSearchParams.max_price)
  const brands = resolvedSearchParams.brands?.split(',')
  const availability = resolvedSearchParams.availability?.split(',')

  // Build Where Clause
  const where = {
    AND: []
  }

  if (categoryId && categoryId !== 'all') where.AND.push({ categoryId })
  if (search) where.AND.push({ name: { contains: search } })
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.AND.push({
      price: {
        gte: minPrice || 0,
        lte: maxPrice || 1000000
      }
    })
  }

  if (brands && brands.length > 0) {
    where.AND.push({ brand: { in: brands } })
  }

  if (availability && availability.length > 0) {
    where.AND.push({ availabilityStatus: { in: availability } })
  }

  // Handle Dynamic Attributes
  // Example: attr_RAM=8GB,16GB -> attributes->RAM contains 8GB OR 16GB
  Object.keys(resolvedSearchParams).forEach(key => {
    if (key.startsWith('attr_')) {
      const attrName = key.replace('attr_', '')
      const values = resolvedSearchParams[key].split(',')
      
      if (values.length > 0) {
        // OR logic for values of the same attribute
        where.AND.push({
          OR: values.map(val => ({
            attributes: {
              path: [attrName],
              string_contains: val // Basic string match
            }
          }))
        })
      }
    }
  })

  // Sorting
  let orderBy = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  if (sort === 'price_desc') orderBy = { price: 'desc' }

  // Fetch Products
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

  // Fetch Aggregations (for Sidebar)
  // Base where for aggregations (should respect category and search, but maybe not other filters to show options?)
  // Usually faceted search respects current filters but shows counts. 
  // Here we just want to show available options in the current category/search context.
  const aggWhere = {
    AND: [
      categoryId && categoryId !== 'all' ? { categoryId } : {},
      search ? { name: { contains: search } } : {}
    ]
  }

  // 1. Get Min/Max Price
  const priceAgg = await db.product.aggregate({
    where: aggWhere,
    _min: { price: true },
    _max: { price: true }
  })

  // 2. Get Brands
  const distinctBrands = await db.product.findMany({
    where: aggWhere,
    select: { brand: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' }
  })
  const availableBrands = distinctBrands.map(p => p.brand).filter(Boolean)

  // 3. Get Common Attributes (Heuristic: fetch first 50 products and extract keys)
  // This is a simplified way to discover attributes without a dedicated schema/table
  const sampleProducts = await db.product.findMany({
    where: aggWhere,
    select: { attributes: true },
    take: 50
  })

  const attributeMap = {}
  sampleProducts.forEach(p => {
    if (p.attributes && typeof p.attributes === 'object') {
      Object.entries(p.attributes).forEach(([key, value]) => {
        if (!attributeMap[key]) attributeMap[key] = new Set()
        attributeMap[key].add(value)
      })
    }
  })

  // Convert Sets to Arrays and sort
  const availableAttributes = {}
  // Only keep attributes with few distinct values (e.g. < 20) to avoid spamming the sidebar
  // And maybe filter out unique IDs or long text
  Object.entries(attributeMap).forEach(([key, valueSet]) => {
    if (valueSet.size > 1 && valueSet.size < 20) {
      availableAttributes[key] = Array.from(valueSet).sort()
    }
  })

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Products</h1>
          <p className="text-muted-foreground">
            {categoryId && categoryId !== 'all' ? 'Browse category products' : 'Discover our complete collection'}
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ProductSidebar 
              minPrice={priceAgg._min.price}
              maxPrice={priceAgg._max.price}
              brands={availableBrands}
              attributes={availableAttributes}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <ProductToolbar totalProducts={totalCount} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
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
      </div>
    </div>
  )
}
