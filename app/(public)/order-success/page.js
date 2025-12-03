'use client'

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function OrderSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart)
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    clearCart()
    toast.success("Order placed successfully!")
  }, [clearCart])

  useEffect(() => {
    if (countdown === 0) {
      router.push('/')
    }
  }, [countdown, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const progress = ((5 - countdown) / 5) * 100

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center space-y-6">
      <div className="animate-in zoom-in duration-500">
        <CheckCircle className="h-24 w-24 text-green-500" />
      </div>
      <h1 className="text-4xl font-bold text-green-600">Payment Successful!</h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Thank you for your order. Your payment has been processed securely. We will contact you shortly for confirmation.
      </p>
      
      <div className="w-full max-w-md space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Redirecting to home...</span>
          <span>{countdown}s</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/orders">
          <Button variant="outline">View Order</Button>
        </Link>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
