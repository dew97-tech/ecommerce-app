"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function ProductSidebar({ 
  minPrice, 
  maxPrice, 
  brands = [], 
  attributes = {}, // { "RAM": ["8GB", "16GB"], "Color": ["Red", "Blue"] }
  className 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("min_price")) || minPrice || 0,
    Number(searchParams.get("max_price")) || maxPrice || 1000000
  ])

  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get("brands")?.split(",") || []
  )

  const [availability, setAvailability] = useState(
    searchParams.get("availability")?.split(",") || []
  )

  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    const attrs = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_")) {
        attrs[key.replace("attr_", "")] = value.split(",")
      }
    })
    return attrs
  })

  // Update local state when URL params change
  useEffect(() => {
    setPriceRange([
      Number(searchParams.get("min_price")) || minPrice || 0,
      Number(searchParams.get("max_price")) || maxPrice || 1000000
    ])
    setSelectedBrands(searchParams.get("brands")?.split(",") || [])
    setAvailability(searchParams.get("availability")?.split(",") || [])
    
    const attrs = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_")) {
        attrs[key.replace("attr_", "")] = value.split(",")
      }
    })
    setSelectedAttributes(attrs)
  }, [searchParams, minPrice, maxPrice])

  const applyFilters = (updates) => {
    const params = new URLSearchParams(searchParams)
    
    // Handle updates
    if (updates.priceRange) {
      params.set("min_price", updates.priceRange[0])
      params.set("max_price", updates.priceRange[1])
    }

    if (updates.brands) {
      if (updates.brands.length > 0) params.set("brands", updates.brands.join(","))
      else params.delete("brands")
    }

    if (updates.availability) {
      if (updates.availability.length > 0) params.set("availability", updates.availability.join(","))
      else params.delete("availability")
    }

    if (updates.attributes) {
      // Clear old attributes
      Array.from(params.keys()).forEach(key => {
        if (key.startsWith("attr_")) params.delete(key)
      })
      // Set new attributes
      Object.entries(updates.attributes).forEach(([key, values]) => {
        if (values.length > 0) {
          params.set(`attr_${key}`, values.join(","))
        }
      })
    }

    params.set("page", "1") // Reset page
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handlePriceChange = (value) => {
    setPriceRange(value)
  }

  const handlePriceCommit = (value) => {
    applyFilters({ priceRange: value, brands: selectedBrands, availability, attributes: selectedAttributes })
  }

  const toggleBrand = (brand) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand]
    setSelectedBrands(newBrands)
    applyFilters({ priceRange, brands: newBrands, availability, attributes: selectedAttributes })
  }

  const toggleAvailability = (status) => {
    const newStatus = availability.includes(status)
      ? availability.filter(s => s !== status)
      : [...availability, status]
    setAvailability(newStatus)
    applyFilters({ priceRange, brands: selectedBrands, availability: newStatus, attributes: selectedAttributes })
  }

  const toggleAttribute = (key, value) => {
    const currentValues = selectedAttributes[key] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    const newAttributes = { ...selectedAttributes, [key]: newValues }
    setSelectedAttributes(newAttributes)
    applyFilters({ priceRange, brands: selectedBrands, availability, attributes: newAttributes })
  }

  const clearAll = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("min_price")
    params.delete("max_price")
    params.delete("brands")
    params.delete("availability")
    Array.from(params.keys()).forEach(key => {
      if (key.startsWith("attr_")) params.delete(key)
    })
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 px-2 text-muted-foreground hover:text-foreground">
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["price", "availability", "brand"]} className="w-full">
        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="px-2 py-4">
              <Slider
                defaultValue={[minPrice, maxPrice]}
                value={priceRange}
                min={minPrice || 0}
                max={maxPrice || 1000000}
                step={100}
                onValueChange={handlePriceChange}
                onValueCommit={handlePriceCommit}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm">
                <span>৳{priceRange[0].toLocaleString()}</span>
                <span>৳{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability */}
        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER", "UP_COMING"].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status}`} 
                    checked={availability.includes(status)}
                    onCheckedChange={() => toggleAvailability(status)}
                  />
                  <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                    {status.replace(/_/g, " ")}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands */}
        {brands.length > 0 && (
          <AccordionItem value="brand">
            <AccordionTrigger>Brand</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`brand-${brand}`} 
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Dynamic Attributes */}
        {Object.entries(attributes).map(([key, values]) => (
          <AccordionItem key={key} value={`attr-${key}`}>
            <AccordionTrigger>{key}</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[150px] pr-4">
                <div className="space-y-2">
                  {values.map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`attr-${key}-${value}`}
                        checked={selectedAttributes[key]?.includes(value)}
                        onCheckedChange={() => toggleAttribute(key, value)}
                      />
                      <Label htmlFor={`attr-${key}-${value}`} className="text-sm font-normal cursor-pointer">
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
