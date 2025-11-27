"use client"

import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function ProductFilters({ categories, hideCategories = false, currentCategory }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(currentCategory || searchParams.get("category") || "all")
  const [sort, setSort] = useState(searchParams.get("sort") || "newest")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ search, category, sort })
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const applyFilters = (filters) => {
    const params = new URLSearchParams(searchParams)
    
    if (filters.search) params.set("search", filters.search)
    else params.delete("search")

    if (!hideCategories && filters.category && filters.category !== "all") params.set("category", filters.category)
    else params.delete("category")

    if (filters.sort) params.set("sort", filters.sort)
    else params.delete("sort")

    // Reset to page 1 on filter change
    params.set("page", "1")

    router.push(`?${params.toString()}`)
  }

  const handleCategoryChange = (value) => {
    setCategory(value)
    applyFilters({ search, category: value, sort })
  }

  const handleSortChange = (value) => {
    setSort(value)
    applyFilters({ search, category, sort: value })
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 items-center bg-card p-4 rounded-lg shadow-sm border">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {!hideCategories && categories && (
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={sort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
