'use server'

import { requireUser } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { db } from "@/lib/db"
import { restoreOrderStock } from "@/lib/orders/stock"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

const CANCELLABLE_STATUSES = ["PENDING", "FAILED"]

const CANCEL_REASONS = [
  "Changed my mind",
  "Found a better price",
  "Ordered by mistake",
  "Delivery taking too long",
  "Payment issue",
  "Other",
]

const cancelSchema = z.object({
  reason: z.enum(CANCEL_REASONS),
  note: z.string().trim().max(500).optional().or(z.literal("")),
})

function revalidateOrderPaths() {
  revalidatePath("/orders")
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
  revalidateTag(CACHE_TAGS.products, "max")
}

export async function cancelOrder(orderId, input) {
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

  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    throw new Error("Processing has started, so this order can no longer be cancelled")
  }

  if (order.paymentStatus === "PAID") {
    throw new Error("Cannot cancel a paid order")
  }

  const parsed = cancelSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error("Please choose a reason for cancelling")
  }

  const { reason, note } = parsed.data
  if (reason === "Other" && !note) {
    throw new Error("Please add a short note for the reason")
  }

  await db.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: {
        id: orderId,
        userId: user.id,
        status: { in: CANCELLABLE_STATUSES },
        paymentStatus: { not: "PAID" },
      },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancellationNote: note || null,
        cancelledBy: "CUSTOMER",
        cancelledAt: new Date(),
      },
    })

    if (updated.count === 0) {
      throw new Error("This order can no longer be cancelled")
    }

    await restoreOrderStock(tx, orderId)
  })

  revalidateOrderPaths()
}

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

  if (order.paymentStatus === "PAID") {
    throw new Error("Cannot delete a paid order")
  }

  if (order.status !== "CANCELLED") {
    throw new Error("Only cancelled orders can be deleted")
  }

  await db.order.delete({ where: { id: orderId } })

  revalidateOrderPaths()
}
