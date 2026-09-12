'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { updateOrderStatus } from "@/lib/actions/admin-orders"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FAILED", label: "Failed" },
]

export function OrderStatusSelect({ orderId, status }) {
  const router = useRouter()
  const [value, setValue] = useState(status)
  const [isPending, startTransition] = useTransition()

  const isFinal = status === "CANCELLED"

  useEffect(() => {
    setValue(status)
  }, [status])

  const handleChange = (next) => {
    if (next === value || isPending) return

    setValue(next)

    startTransition(async () => {
      const formData = new FormData()
      formData.set("status", next)

      try {
        const result = await updateOrderStatus(orderId, formData)

        if (result?.success) {
          toast.success(result.message || "Order status updated.")
          router.refresh()
          return
        }

        setValue(status)
        toast.error(result?.message || "Failed to update order status.")
      } catch (error) {
        console.error("Failed to update order status:", error)
        setValue(status)
        toast.error("Failed to update order status.")
      }
    })
  }

  const trigger = (
    <SelectTrigger
      size="sm"
      className="w-[132px]"
      aria-label={isFinal ? "Order status (final)" : "Update order status"}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {isPending && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
        <SelectValue />
      </span>
    </SelectTrigger>
  )

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={isPending || isFinal}
    >
      {isFinal ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-flex">
              {trigger}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            Cancelled orders are final and cannot be reopened.
          </TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
