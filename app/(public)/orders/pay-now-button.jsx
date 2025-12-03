'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

export function PayNowButton({ orderId, amount }) {
  const [loading, setLoading] = useState(false)

  const handlePayNow = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sslcommerz/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error("Failed to initiate payment")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handlePayNow} 
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </Button>
  )
}
