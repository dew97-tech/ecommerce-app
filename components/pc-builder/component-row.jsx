'use client'

import { Button } from "@/components/ui/button"
import { usePcBuilderStore } from "@/store/usePcBuilderStore"
import { ChevronRight, Plus, RefreshCw, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function ComponentRow({ type, label, category, icon: Icon }) {
  const { components, removeComponent } = usePcBuilderStore()
  const selectedProduct = components[type]

  // Map type/label to a URL-friendly category slug
  // In a real app, you might want a more robust mapping or pass the category ID directly
  const categorySlug = category || label

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex flex-col sm:flex-row items-center gap-6 p-5">
        {/* Icon/Label Section */}
        <div className="flex items-center gap-5 w-full sm:w-64 shrink-0">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${selectedProduct ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
            {!selectedProduct && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-500 w-fit">
                Required
              </span>
            )}
          </div>
        </div>

        {/* Product Details or Select Button */}
        <div className="flex-1 w-full min-w-0">
          {selectedProduct ? (
            <div className="flex items-center gap-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                {selectedProduct.images?.[0] ? (
                  <Image
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Icon className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0 gap-1">
                <h4 className="font-semibold truncate pr-4 text-foreground">{selectedProduct.name}</h4>
                <p className="text-lg font-bold text-primary">৳{selectedProduct.price.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="h-16 flex items-center">
               <div className="h-2 w-full max-w-[200px] rounded-full bg-muted/20" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end mt-4 sm:mt-0">
          {selectedProduct ? (
            <>
              <Link href={`/pc-builder/select/${encodeURIComponent(categorySlug)}?type=${type}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all"
                  title="Change"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeComponent(type)}
                className="h-10 w-10 rounded-full bg-background/50 hover:bg-destructive hover:text-destructive-foreground transition-all"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href={`/pc-builder/select/${encodeURIComponent(categorySlug)}?type=${type}`} className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto gap-2 border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group/btn"
              >
                <Plus className="h-4 w-4" />
                Select
                <ChevronRight className="h-4 w-4 opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Progress Bar Effect for Selected Items */}
      {selectedProduct && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600" />
      )}
    </div>
  )
}
