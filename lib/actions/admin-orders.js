'use server'

import { requireAdmin } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const statusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
])

export async function updateOrderStatus(orderId, formData) {
  await requireAdmin()

  const parsedStatus = statusSchema.safeParse(formData.get("status"))
  if (!parsedStatus.success) {
    return { message: "Invalid order status." }
  }

  try {
    await db.order.update({
      where: { id: orderId },
      data: { status: parsedStatus.data }
    })
    revalidatePath("/admin/orders")
    return { message: "Order status updated." }
  } catch (error) {
    console.error(error)
    return { message: "Failed to update order status." }
  }
}
