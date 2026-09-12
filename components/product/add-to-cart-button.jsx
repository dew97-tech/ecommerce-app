'use client'

import { Button } from "@/components/ui/button"
import { validateCartLine } from "@/lib/actions/cart"
import { useCartStore } from "@/store/useCartStore"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function AddToCartButton({ product }) {
  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  const [isPending, setIsPending] = useState(false)

  const currentStock = product.selectedVariant ? product.selectedVariant.stock : product.stock
  const isOutOfStock = currentStock === 0

  const handleAddToCart = async () => {
    if (isPending) return

    let image = "/placeholder.png"
    if (product.images) {
      try {
        const images = JSON.parse(product.images)
        if (Array.isArray(images) && images.length > 0) {
          image = images[0]
        }
      } catch (e) {
        image = product.images.split(',')[0]
      }
    }

    setIsPending(true)

    try {
      const existingQuantity =
        items.find((item) => item.id === product.id)?.quantity ?? 0
      const requested = existingQuantity + 1
      const fresh = await validateCartLine(product.id, requested)

      if (!fresh || !fresh.available) {
        toast.error("This product is out of stock")
        return
      }

      const price = product.selectedVariant
        ? fresh.price + (product.selectedVariant.price || 0)
        : fresh.price

      addItem({
        id: product.id,
        slug: product.slug,
        name: fresh.name,
        price,
        image: fresh.image || image,
        quantity: 1,
        stock: fresh.stock,
        ...(product.selectedVariant && {
          variant: {
            color: product.selectedVariant.color,
            size: product.selectedVariant.size,
            capacity: product.selectedVariant.capacity,
          },
        }),
      })

      if (requested > fresh.stock) {
        toast.error(`Only ${fresh.stock} left in stock`)
      } else {
        toast.success("Added to cart")
      }
    } catch (error) {
      console.error("Add to cart error:", error)
      toast.error("Could not verify stock. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button 
      size="lg" 
      className="w-full md:w-auto" 
      onClick={handleAddToCart}
      disabled={isOutOfStock || isPending}
    >
      {isOutOfStock ? (
        'Out of Stock'
      ) : isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        'Add to Cart'
      )}
    </Button>
  )
}
