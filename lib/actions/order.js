'use server'

import { requireUser } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { db } from "@/lib/db"
import { revalidatePath, revalidateTag } from "next/cache"

export async function deleteOrder(orderId) {
  const user = await requireUser()

  const order = await db.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error("Order not found")
  }

  if (order.userId !== user.id) {
    throw new Error("Unauthorized")
  }

  if (order.paymentStatus === 'PAID') {
    throw new Error("Cannot delete a paid order")
  }

  if (order.status !== 'PENDING' && order.status !== 'FAILED' && order.status !== 'CANCELLED') {
    throw new Error("Cannot delete processed orders")
  }

  await db.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { orderId } })


    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }

    await tx.order.delete({ where: { id: orderId } })
  })

  revalidatePath("/orders")
  revalidateTag(CACHE_TAGS.products, "max")
}
