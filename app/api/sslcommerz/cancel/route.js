import { db } from "@/lib/db"
import { CACHE_TAGS } from "@/lib/cache/config"
import { restoreOrderStock } from "@/lib/orders/stock"
import { sslcommerz } from "@/lib/services/sslcommerz"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

export async function POST(req) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const formData = await req.formData()
    const data = Object.fromEntries(formData)
    const { val_id } = data

    if (!val_id) {
      return NextResponse.redirect(`${baseUrl}/checkout?error=payment_cancelled`, 303)
    }

    const validationResponse = await sslcommerz.validate({ val_id })

    if (!validationResponse || validationResponse.status !== 'CANCELLED') {
      return NextResponse.redirect(`${baseUrl}/checkout?error=payment_cancelled`, 303)
    }

    const order = await db.order.findUnique({
      where: { transactionId: validationResponse.tran_id },
    })

    const amountMatches =
      order && Math.abs(Number(validationResponse.amount) - order.totalAmount) < 0.01

    if (order && order.status === 'PENDING' && order.paymentStatus !== 'PAID' && amountMatches) {
      await db.$transaction(async (tx) => {
        const updated = await tx.order.updateMany({
          where: { id: order.id, status: 'PENDING', paymentStatus: { not: 'PAID' } },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'CANCELLED',
            valId: val_id,
            cancellationReason: 'Payment cancelled at gateway',
            cancelledBy: 'CUSTOMER',
            cancelledAt: new Date(),
          },
        })

        if (updated.count === 0) return

        await restoreOrderStock(tx, order.id)
      })

      revalidatePath("/orders")
      revalidatePath("/admin/orders")
      revalidatePath("/admin")
      revalidateTag(CACHE_TAGS.products, "max")
    }

    return NextResponse.redirect(`${baseUrl}/checkout?error=payment_cancelled`, 303)
  } catch (error) {
    console.error("SSLCommerz Cancel Error:", error)
    return NextResponse.redirect(`${baseUrl}/checkout?error=internal_error`, 303)
  }
}
