'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { getProductsByCategory } from "@/lib/actions/pc-builder"
import { usePcBuilderStore } from "@/store/usePcBuilderStore"
import { ArrowLeft, ChevronLeft, ChevronRight, Filter, Loader2, Plus, Search, ShoppingCart, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { use, useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

export default function SelectionPage({ params }) {
  const { category } = use(params)
  const categoryName = decodeURIComponent(category)
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const router = useRouter()
  
  // State
  const [query, setQuery] = useState("")
  const [debouncedQuery] = useDebounce(query, 500)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  
  // Filters
  const [page, setPage] = useState(1)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState([0, 200000])
  const [debouncedPriceRange] = useDebounce(priceRange, 500)
  const [showFilters, setShowFilters] = useState(false)

  const { addComponent } = usePcBuilderStore()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const data = await getProductsByCategory(categoryName, debouncedQuery, {
        page,
        limit: 12,
        minPrice: debouncedPriceRange[0],
        maxPrice: debouncedPriceRange[1],
        brand: selectedBrands.length > 0 ? { in: selectedBrands } : undefined
      })
      
      setProducts(data.products)
      setTotalPages(data.totalPages)
      // Only set brands once to avoid flickering or losing available brands when filtering
      if (brands.length === 0) setBrands(data.brands)
      
      setLoading(false)
    }
    fetchProducts()
  }, [categoryName, debouncedQuery, page, debouncedPriceRange, selectedBrands])

  const handleSelect = (product) => {
    if (type) {
      addComponent(type, product)
      router.push('/pc-builder')
    }
  }

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
    setPage(1) // Reset to page 1 on filter change
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center gap-4">
          <Link href="/pc-builder">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          
          <div className="flex-1 max-w-2xl mx-auto relative">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
              <div className="relative flex items-center bg-background rounded-full shadow-sm">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={`Search ${categoryName}...`}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  className="pl-12 h-12 rounded-full border-transparent focus:border-transparent focus:ring-0 bg-transparent text-lg"
                />
                {query && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 h-8 w-8 rounded-full hover:bg-muted"
                    onClick={() => setQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar Filters */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-background border-r p-6 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 lg:border-none lg:p-0 lg:bg-transparent
          ${showFilters ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="font-bold text-xl">Filters</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-8">
            {/* Price Filter */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Price Range</h3>
              <Slider
                defaultValue={[0, 200000]}
                max={200000}
                step={1000}
                value={priceRange}
                onValueChange={(val) => { setPriceRange(val); setPage(1); }}
                className="py-4"
              />
              <div className="flex items-center justify-between text-sm font-medium">
                <span>৳{priceRange[0].toLocaleString()}</span>
                <span>৳{priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Brands</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`brand-${brand}`} 
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => handleBrandToggle(brand)}
                    />
                    <Label 
                      htmlFor={`brand-${brand}`}
                      className="text-sm font-normal cursor-pointer hover:text-primary transition-colors"
                    >
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile filters */}
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <div className="p-6 bg-muted/30 rounded-full">
                  <ShoppingCart className="h-12 w-12 opacity-20" />
              </div>
              <p className="text-lg font-medium">No products found</p>
              <Button variant="link" onClick={() => {
                setQuery("")
                setPriceRange([0, 200000])
                setSelectedBrands([])
              }}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-white p-4">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                          No Image
                        </div>
                      )}
                      
                      {/* Quick Add Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <Button onClick={() => handleSelect(product)} className="rounded-full font-bold shadow-xl scale-90 group-hover:scale-100 transition-transform">
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Build
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2">
                      <h3 className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-auto flex items-center justify-between">
                        <p className="text-xl font-bold text-primary">৳{product.price.toLocaleString()}</p>
                        {product.stock > 0 ? (
                            <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full">In Stock</span>
                        ) : (
                            <span className="text-xs font-medium text-red-600 bg-red-500/10 px-2 py-1 rounded-full">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
