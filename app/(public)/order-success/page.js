'use client'

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function OrderSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center space-y-6">
      <CheckCircle className="h-20 w-20 text-green-500" />
      <h1 className="text-4xl font-bold">Order Placed Successfully!</h1>
      <p className="text-muted-foreground text-lg">
        Thank you for your order. We will contact you shortly for confirmation.
      </p>
      <Link href="/">
        <Button size="lg">Continue Shopping</Button>
      </Link>
    </div>
  )
}
