'use client'

import { AddToCartButton } from "@/components/add-to-cart-button"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Package, Shield, Truck } from "lucide-react"
import { useState } from "react"

export function ProductDetails({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null)
  
  const currentPrice = selectedVariant ? product.price + (selectedVariant.price || 0) : product.price
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="secondary" className="mb-3">{product.category?.name}</Badge>
        <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">{product.name}</h1>
      </div>

      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-bold text-primary">৳{currentPrice.toLocaleString()}</span>
        {product.discountedPrice && (
          <>
            <span className="text-2xl text-muted-foreground line-through">
              ৳{product.discountedPrice.toLocaleString()}
            </span>
            <Badge className="bg-red-500">
              {Math.round(((product.discountedPrice - currentPrice) / product.discountedPrice) * 100)}% OFF
            </Badge>
          </>
        )}
      </div>

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-5">
          {product.variants.some(v => v.color) && (
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wide">Color</label>
              <div className="flex gap-2 flex-wrap">
                {[...new Set(product.variants.filter(v => v.color).map(v => v.color))].map(color => (
                  <Button
                    key={color}
                    variant={selectedVariant?.color === color ? "default" : "outline"}
                    size="lg"
                    className="min-w-[100px]"
                    onClick={() => setSelectedVariant(product.variants.find(v => v.color === color))}
                  >
                    {selectedVariant?.color === color && <Check className="mr-2 h-4 w-4" />}
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {product.variants.some(v => v.size) && (
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wide">Size</label>
              <div className="flex gap-2 flex-wrap">
                {[...new Set(product.variants.filter(v => v.size).map(v => v.size))].map(size => (
                  <Button
                    key={size}
                    variant={selectedVariant?.size === size ? "default" : "outline"}
                    size="lg"
                    className="min-w-[80px]"
                    onClick={() => setSelectedVariant(product.variants.find(v => v.size === size))}
                  >
                    {selectedVariant?.size === size && <Check className="mr-2 h-4 w-4" />}
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {product.variants.some(v => v.capacity) && (
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wide">Capacity</label>
              <div className="flex gap-2 flex-wrap">
                {[...new Set(product.variants.filter(v => v.capacity).map(v => v.capacity))].map(capacity => (
                  <Button
                    key={capacity}
                    variant={selectedVariant?.capacity === capacity ? "default" : "outline"}
                    size="lg"
                    className="min-w-[100px]"
                    onClick={() => setSelectedVariant(product.variants.find(v => v.capacity === capacity))}
                  >
                    {selectedVariant?.capacity === capacity && <Check className="mr-2 h-4 w-4" />}
                    {capacity}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Badge variant={currentStock > 0 ? "default" : "destructive"} className="text-sm px-3 py-1">
          {currentStock > 0 ? `In Stock • ${currentStock} available` : 'Out of Stock'}
        </Badge>
      </div>

      <AddToCartButton product={{ ...product, selectedVariant }} />

      <Separator />

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col items-center text-center border-0 shadow-md hover:shadow-lg transition-shadow">
          <Truck className="h-7 w-7 mb-3 text-primary" />
          <p className="text-sm font-semibold">Free Delivery</p>
          <p className="text-xs text-muted-foreground mt-1">On all orders</p>
        </Card>
        <Card className="p-5 flex flex-col items-center text-center border-0 shadow-md hover:shadow-lg transition-shadow">
          <Package className="h-7 w-7 mb-3 text-primary" />
          <p className="text-sm font-semibold">Easy Returns</p>
          <p className="text-xs text-muted-foreground mt-1">30-day policy</p>
        </Card>
        <Card className="p-5 flex flex-col items-center text-center border-0 shadow-md hover:shadow-lg transition-shadow">
          <Shield className="h-7 w-7 mb-3 text-primary" />
          <p className="text-sm font-semibold">Warranty</p>
          <p className="text-xs text-muted-foreground mt-1">1-year coverage</p>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold mb-6">Product Description</h2>
        <div className="prose prose-sm max-w-none">
          <MarkdownRenderer content={product.description} />
        </div>
      </div>
    </div>
  )
}
