'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function CategoryParentFilter({ roots = [], value = "all" }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (nextValue) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1')

    if (nextValue && nextValue !== 'all') {
      params.set('parent', nextValue)
    } else {
      params.delete('parent')
    }

    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-[190px]" aria-label="Filter by parent category">
        <SelectValue placeholder="All categories" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value="all">All categories</SelectItem>
        <SelectItem value="roots">Top-level only</SelectItem>
        {roots.map((root) => (
          <SelectItem key={root.id} value={root.id}>
            Under {root.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
