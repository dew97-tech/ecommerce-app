'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/useCartStore"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function CartView() {
  const [isMounted, setIsMounted] = useState(false)
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const total = useCartStore((state) => state.total)
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
           <div className="h-24 bg-muted/30 animate-pulse rounded-xl" />
           <div className="h-24 bg-muted/30 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  const handleRemove = (id) => {
    removeItem(id)
    toast.error("Item removed from cart")
  }

  const handleClear = () => {
    clearCart()
    toast.error("Cart cleared")
  }

  const handleUpdateQuantity = (id, newQuantity) => {
    updateQuantity(id, newQuantity)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground/40" />
        <h2 className="text-3xl font-bold mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Start adding some products to your cart!</p>
        <Link href="/products">
          <Button size="lg" className="shadow-lg">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-accent/20 flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{item.name}</h3>
                  <p className="text-primary font-bold text-xl mb-3">৳{item.price.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-accent/30 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-accent"
                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-accent"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                  <p className="font-bold text-xl">৳{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button
          variant="outline"
          className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleClear}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-20 border-0 shadow-lg">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">৳{total().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">৳{total().toLocaleString()}</span>
              </div>
            </div>

            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full shadow-lg">
                Proceed to Checkout
              </Button>
            </Link>
            
            <Link href="/products" className="block">
              <Button variant="outline" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
