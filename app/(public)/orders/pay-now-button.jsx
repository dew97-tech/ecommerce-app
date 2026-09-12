'use client'

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { toast } from "sonner"

export function PayNowButton({ orderId, amount, inFlight = false }) {
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
        toast.error(data.message || "Failed to initiate payment")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (inFlight) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex">
            <Button disabled className="bg-green-600 text-white">
              Payment in progress
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          A payment is already in progress for this order. Complete it, or wait
          for the gateway to respond before trying again.
        </TooltipContent>
      </Tooltip>
    )
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
