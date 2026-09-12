'use client'

import { Button } from "@/components/ui/button"
import { getSellingPrice } from "@/lib/price"
import { useCartStore } from "@/store/useCartStore"
import { toast } from "sonner"

export function AddToCartButton({ product }) {
  const addItem = useCartStore((state) => state.addItem)

  const currentStock = product.selectedVariant ? product.selectedVariant.stock : product.stock
  const isOutOfStock = currentStock === 0

  const handleAddToCart = () => {

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
    

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.selectedVariant 
        ? getSellingPrice(product) + (product.selectedVariant.price || 0)
        : getSellingPrice(product),
      image: image,
      quantity: 1,
      stock: currentStock,
      ...(product.selectedVariant && {
        variant: {
          color: product.selectedVariant.color,
          size: product.selectedVariant.size,
          capacity: product.selectedVariant.capacity,
        },
      }),
    }
    
    addItem(cartItem)
    toast.success("Added to cart")
  }

  return (
    <Button 
      size="lg" 
      className="w-full md:w-auto" 
      onClick={handleAddToCart}
      disabled={isOutOfStock}
    >
      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  )
}
