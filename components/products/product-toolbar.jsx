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
import { useEffect, useRef, useState } from "react"

export function ProductToolbar({ totalProducts }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [sort, setSort] = useState(searchParams.get("sort") || "newest")
  const [limit, setLimit] = useState(searchParams.get("limit") || "12")
  
  const isMounted = useRef(false)

  // Debounce search
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    console.log("ProductToolbar: Search changed, applying filters", search)
    
    // Strict check: If search state matches URL param, DO NOT trigger update
    // This prevents page reset on navigation/mount
    const currentSearch = searchParams.get("search") || ""
    if (search === currentSearch) {
      console.log("ProductToolbar: Search matches URL, skipping update")
      return
    }

    const timer = setTimeout(() => {
      applyFilters({ search, sort, limit })
    }, 500)

    return () => clearTimeout(timer)
  }, [search, searchParams])

  const applyFilters = (filters) => {
    console.log("ProductToolbar: applyFilters called", filters)
    const params = new URLSearchParams(searchParams)
    
    if (filters.search) params.set("search", filters.search)
    else params.delete("search")

    if (filters.sort) params.set("sort", filters.sort)
    else params.delete("sort")

    if (filters.limit) params.set("limit", filters.limit)
    else params.delete("limit")

    // Reset to page 1 on filter change
    params.set("page", "1")

    console.log("ProductToolbar: Pushing new params", params.toString())
    router.push(`?${params.toString()}`)
  }

  const handleSortChange = (value) => {
    setSort(value)
    applyFilters({ search, sort: value, limit })
  }

  const handleLimitChange = (value) => {
    setLimit(value)
    applyFilters({ search, sort, limit: value })
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-card p-4 rounded-lg shadow-sm border">
      <div className="relative w-full md:w-auto md:flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="text-sm text-muted-foreground hidden md:block whitespace-nowrap">
          {totalProducts} Products Found
        </div>

        <Select value={limit} onValueChange={handleLimitChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Show" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 per page</SelectItem>
            <SelectItem value="24">24 per page</SelectItem>
            <SelectItem value="48">48 per page</SelectItem>
            <SelectItem value="96">96 per page</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
