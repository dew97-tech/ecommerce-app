'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function deleteOrder(orderId) {
  const session = await auth()
  if (!session) {
    throw new Error("Unauthorized")
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error("Order not found")
  }

  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  if (order.status !== 'PENDING' && order.status !== 'FAILED' && order.status !== 'CANCELLED') {
    throw new Error("Cannot delete processed orders")
  }

  await db.order.delete({
    where: { id: orderId },
  })

  revalidatePath("/orders")
}
