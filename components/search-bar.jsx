'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSuggestions } from "@/lib/search-actions"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function SearchBar({ className }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef(null)
  const router = useRouter()

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true)
        const suggestions = await getSuggestions(query)
        setResults(suggestions)
        setIsLoading(false)
        setShowSuggestions(true)
      } else {
        setResults([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (slug) => {
    router.push(`/products/${slug}`)
    setShowSuggestions(false)
    setQuery("")
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setShowSuggestions(false)
  }

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-2xl", className)}>
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          placeholder="Search for products, brands..."
          className="w-full pl-4 pr-12 h-11 bg-input border-border focus-visible:ring-primary/20 rounded-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length >= 2) setShowSuggestions(true)
          }}
        />
        {query && (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-10 top-0 h-11 w-8 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
            >
                <X className="h-4 w-4" />
            </Button>
        )}
        <Button 
          type="submit"
          size="icon" 
          className="absolute right-0 top-0 h-11 w-11 rounded-l-none rounded-r-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Search className="h-5 w-5" />
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 w-full mt-2 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading suggestions...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Products
              </div>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.slug)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="relative h-10 w-10 bg-white rounded border border-border/50 flex-shrink-0 overflow-hidden">
                    {product.image ? (
                        <Image 
                            src={product.image} 
                            alt={product.name} 
                            fill 
                            className="object-contain p-1" 
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{product.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{product.brand}</span>
                        {product.category && <span>• {product.category.name}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">
                        ৳{product.discountedPrice || product.price}
                    </div>
                    {product.discountedPrice && (
                        <div className="text-xs text-muted-foreground line-through">
                            ৳{product.price}
                        </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <button
                    onClick={handleSearch}
                    className="w-full text-center py-2 text-sm text-primary hover:bg-accent/50 transition-colors font-medium"
                >
                    View all results for "{query}"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
