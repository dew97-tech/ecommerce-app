'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

// Component for the "More" dropdown (handles multiple categories)
export function MultiCategoryMenu({ categories, trigger = "More" }) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeBrand, setActiveBrand] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open) => {
    setIsOpen(open)
    if (open && categories?.length > 0) {
        const firstCat = categories[0]
        setActiveCategory(firstCat)
        if (firstCat.brands?.length > 0) {
            setActiveBrand(firstCat.brands[0])
        }
    } else {
        setActiveCategory(null)
        setActiveBrand(null)
    }
  }

  const handleCategoryHover = (category) => {
    setActiveCategory(category)
    if (category.brands?.length > 0) {
        setActiveBrand(category.brands[0])
    } else {
        setActiveBrand(null)
    }
  }

  return (
    <div 
        className="h-full flex items-center"
        onMouseEnter={() => handleOpenChange(true)}
        onMouseLeave={() => handleOpenChange(false)}
    >
      <div 
        className={cn(
            "text-muted-foreground hover:text-primary transition-colors h-full flex items-center px-1 relative cursor-pointer gap-1",
            isOpen && "text-primary"
        )}
      >
        {trigger}
        <ChevronDown className="h-3 w-3" />
        {isOpen && (
            <motion.div 
                layoutId="nav-indicator"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
            />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-background border-b border-border shadow-xl z-50 overflow-hidden"
            style={{ height: '400px' }}
          >
            <div className="container mx-auto h-full flex">
              {/* Column 1: Categories */}
              <div className="w-1/4 border-r border-border h-full overflow-y-auto py-4 bg-accent/10">
                <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    More Categories
                </h3>
                <div className="space-y-1 px-2">
                    {categories?.map((category) => (
                        <div
                            key={category.id}
                            onMouseEnter={() => handleCategoryHover(category)}
                            className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium",
                                activeCategory?.id === category.id 
                                    ? "bg-primary text-primary-foreground" 
                                    : "hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                {category.name}
                            </span>
                            {activeCategory?.id === category.id && (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-border/50">
                        <Link href="/categories" className="block px-3 py-2 text-sm text-primary hover:underline">
                            View All Categories &rarr;
                        </Link>
                    </div>
                </div>
              </div>

              {/* Column 2: Brands */}
              <div className="w-1/4 border-r border-border h-full overflow-y-auto py-4">
                <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {activeCategory ? `Brands in ${activeCategory.name}` : 'Select a Category'}
                </h3>
                <div className="space-y-1 px-2">
                    {activeCategory?.brands?.map((brand) => (
                        <div
                            key={brand}
                            onMouseEnter={() => setActiveBrand(brand)}
                            className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm",
                                activeBrand === brand 
                                    ? "bg-accent text-accent-foreground font-medium" 
                                    : "hover:bg-accent/50"
                            )}
                        >
                            {brand}
                            {activeBrand === brand && (
                                <ChevronRight className="h-3 w-3 opacity-50" />
                            )}
                        </div>
                    ))}
                    {(!activeCategory?.brands || activeCategory.brands.length === 0) && (
                        <div className="px-4 py-8 text-sm text-muted-foreground text-center">
                            No brands found.
                        </div>
                    )}
                </div>
              </div>

              {/* Column 3: Products */}
              <div className="w-2/4 h-full overflow-y-auto py-4 bg-accent/5">
                <ProductGrid 
                    products={activeCategory?.products} 
                    activeBrand={activeBrand} 
                    title={activeBrand ? `Top Products from ${activeBrand}` : 'Featured Products'} 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Component for a single top-level category
export function SingleCategoryMenu({ category }) {
  const [activeBrand, setActiveBrand] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open) => {
    setIsOpen(open)
    if (open && category.brands?.length > 0) {
        setActiveBrand(category.brands[0])
    } else {
        setActiveBrand(null)
    }
  }

  return (
    <div 
        className="h-full flex items-center"
        onMouseEnter={() => handleOpenChange(true)}
        onMouseLeave={() => handleOpenChange(false)}
    >
      <Link 
        href={`/categories/${category.slug}`} // Assuming category page exists or filter
        className={cn(
            "text-muted-foreground hover:text-primary transition-colors h-full flex items-center px-1 relative",
            isOpen && "text-primary"
        )}
      >
        {category.name}
        {isOpen && (
            <motion.div 
                layoutId="nav-indicator"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
            />
        )}
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-background border-b border-border shadow-xl z-50 overflow-hidden"
            style={{ height: '350px' }}
          >
            <div className="container mx-auto h-full flex">
              {/* Column 1: Brands */}
              <div className="w-1/4 border-r border-border h-full overflow-y-auto py-4 bg-accent/5">
                <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Brands
                </h3>
                <div className="space-y-1 px-2">
                    {category.brands?.map((brand) => (
                        <div
                            key={brand}
                            onMouseEnter={() => setActiveBrand(brand)}
                            className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm",
                                activeBrand === brand 
                                    ? "bg-accent text-accent-foreground font-medium" 
                                    : "hover:bg-accent/50"
                            )}
                        >
                            {brand}
                            {activeBrand === brand && (
                                <ChevronRight className="h-3 w-3 opacity-50" />
                            )}
                        </div>
                    ))}
                     <div className="pt-2 mt-2 border-t border-border/50">
                        <Link href="/categories" className="block px-3 py-2 text-sm text-primary hover:underline">
                            View All Categories &rarr;
                        </Link>
                    </div>
                </div>
              </div>

              {/* Column 2: Products */}
              <div className="w-3/4 h-full overflow-y-auto py-4">
                <ProductGrid 
                    products={category.products} 
                    activeBrand={activeBrand} 
                    title={activeBrand ? `Top ${activeBrand} Products` : `Top ${category.name} Products`} 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProductGrid({ products, activeBrand, title }) {
    return (
        <>
            <h3 className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                {title}
            </h3>
            
            <div className="grid grid-cols-4 gap-4 px-6">
                {products
                    ?.filter(p => !activeBrand || p.brand === activeBrand)
                    .slice(0, 8)
                    .map((product) => (
                    <Link 
                        key={product.id} 
                        href={`/products/${product.slug}`}
                        className="group flex flex-col gap-2 p-3 rounded-lg hover:bg-accent/10 hover:shadow-sm border border-transparent hover:border-border transition-all"
                    >
                        <div className="relative aspect-square bg-white rounded-md overflow-hidden border border-border/50">
                            {product.images ? (
                                <Image 
                                    src={product.images} 
                                    alt={product.name}
                                    fill
                                    className="object-contain p-2"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2 h-10">
                                {product.name}
                            </h4>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-bold">
                                    ৳{product.price.toLocaleString()}
                                </span>
                                {product.discountedPrice && (
                                    <Badge variant="destructive" className="text-[10px] px-1 h-4">
                                        Sale
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
                
                {(!products || products.length === 0) && (
                    <div className="col-span-4 py-12 text-center text-muted-foreground">
                        No products found.
                    </div>
                )}
            </div>
        </>
    )
}
