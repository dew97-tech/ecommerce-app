'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId, formData) {
  const status = formData.get("status")
  
  try {
    await db.order.update({
      where: { id: orderId },
      data: { status }
    })
    revalidatePath("/admin/orders")
    return { message: "Order status updated." }
  } catch (error) {
    return { message: "Failed to update order status." }
  }
}
