'use client'

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { toast } from "sonner"

export function AddToCartButton({ product }) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    // Extract first image
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
    
    // Format item for cart store
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.selectedVariant 
        ? product.price + (product.selectedVariant.price || 0)
        : product.price,
      image: image,
      quantity: 1,
      variant: product.selectedVariant ? {
        color: product.selectedVariant.color,
        size: product.selectedVariant.size,
        capacity: product.selectedVariant.capacity,
      } : null
    }
    
    addItem(cartItem)
    toast.success("Added to cart")
  }

  return (
    <Button 
      size="lg" 
      className="w-full md:w-auto" 
      onClick={handleAddToCart}
      disabled={product.stock === 0 && (!product.selectedVariant || product.selectedVariant.stock === 0)}
    >
      {product.stock === 0 && (!product.selectedVariant || product.selectedVariant.stock === 0) 
        ? 'Out of Stock' 
        : 'Add to Cart'}
    </Button>
  )
}
