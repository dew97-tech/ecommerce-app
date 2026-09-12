'use server'

import { requireAdmin } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { db } from "@/lib/db"
import { restoreOrderStock } from "@/lib/orders/stock"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

const statusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
])

const RESTORE_STATUSES = ["PENDING", "PROCESSING", "FAILED"]

export async function updateOrderStatus(orderId, formData) {
  await requireAdmin()

  const parsedStatus = statusSchema.safeParse(formData.get("status"))
  if (!parsedStatus.success) {
    return { success: false, message: "Invalid order status." }
  }

  const nextStatus = parsedStatus.data

  try {
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      })

      if (!order) {
        throw new Error("ORDER_NOT_FOUND")
      }

      if (order.status === nextStatus) {
        return
      }

      if (order.status === "CANCELLED") {
        throw new Error("ORDER_CANCELLED")
      }

      if (nextStatus === "CANCELLED" && RESTORE_STATUSES.includes(order.status)) {
        const updated = await tx.order.updateMany({
          where: { id: orderId, status: order.status },
          data: {
            status: nextStatus,
            cancelledBy: "ADMIN",
            cancelledAt: new Date(),
          },
        })

        if (updated.count === 0) {
          throw new Error("STALE_STATUS")
        }

        await restoreOrderStock(tx, orderId)
        return
      }

      const updated = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: {
          status: nextStatus,
          ...(nextStatus === "CANCELLED"
            ? { cancelledBy: "ADMIN", cancelledAt: new Date() }
            : {}),
        },
      })

      if (updated.count === 0) {
        throw new Error("STALE_STATUS")
      }
    })

    revalidatePath("/admin/orders")
    revalidatePath("/admin")
    revalidatePath("/orders")
    revalidateTag(CACHE_TAGS.products, "max")
    return { success: true, message: "Order status updated." }
  } catch (error) {
    if (error.message === "ORDER_CANCELLED") {
      return {
        success: false,
        message: "Cancelled orders are final and cannot be reopened.",
      }
    }
    if (error.message === "STALE_STATUS") {
      return {
        success: false,
        message: "This order was updated elsewhere. Refresh and try again.",
      }
    }
    if (error.message === "ORDER_NOT_FOUND") {
      return { success: false, message: "Order not found." }
    }
    console.error(error)
    return { success: false, message: "Failed to update order status." }
  }
}
