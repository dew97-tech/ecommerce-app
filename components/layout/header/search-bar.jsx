'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSellingPrice } from "@/lib/price"
import { getSuggestions } from "@/lib/actions/search"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function SearchBar({ className, onActivate }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true)
        const suggestions = await getSuggestions(query)
        setResults(suggestions)
        setIsLoading(false)
        setShowSuggestions(true)
        setActiveIndex(-1)
      } else {
        setResults([])
        setShowSuggestions(false)
        setActiveIndex(-1)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setActiveIndex(-1)
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
    setActiveIndex(-1)
    setQuery("")
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (!showSuggestions && results.length > 0) setShowSuggestions(true)
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, -1))
      return
    }

    if (event.key === "Enter") {
      if (showSuggestions && activeIndex >= 0 && results[activeIndex]) {
        event.preventDefault()
        handleSuggestionClick(results[activeIndex].slug)
      }
      return
    }

    if (event.key === "Escape") {
      setShowSuggestions(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-2xl", className)}>
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
          }
          placeholder="Search for products, brands..."
          className="h-11 w-full rounded-lg border-border bg-input pl-4 pr-12 focus-visible:ring-primary/20"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            onActivate?.()
          }}
          onFocus={() => {
            onActivate?.()
            if (query.length >= 2) setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
        />

        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-10 top-0 h-11 w-8 text-muted-foreground hover:text-foreground"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <Button
          type="submit"
          size="icon"
          className="absolute right-0 top-0 h-11 w-11 rounded-l-none rounded-r-lg bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </form>

      {showSuggestions && (
        <div
          id="search-suggestions"
          role="listbox"
          className="thin-scrollbar absolute left-0 top-full z-50 mt-2 max-h-[420px] w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
        >
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-1.5">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Products
              </div>

              {results.map((product, index) => (
                <div
                  key={product.id}
                  id={`search-option-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSuggestionClick(product.slug)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors",
                    activeIndex === index ? "bg-accent" : "hover:bg-accent/60"
                  )}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border/60 bg-white">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.brand}
                      {product.category ? ` • ${product.category.name}` : ""}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-price">
                      ৳{getSellingPrice(product).toLocaleString("en-US")}
                    </p>
                    {product.discountedPrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        ৳{product.price.toLocaleString("en-US")}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-1 border-t border-border pt-1">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-accent/60"
                >
                  View all results for &quot;{query}&quot;
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No products found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
