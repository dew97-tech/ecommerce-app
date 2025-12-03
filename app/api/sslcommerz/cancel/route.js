import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const formData = await req.formData()
    const data = Object.fromEntries(formData)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (data.tran_id) {
      await db.order.update({
        where: { id: data.tran_id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'CANCELLED'
        }
      })
    }

    return NextResponse.redirect(`${baseUrl}/checkout?error=payment_cancelled`, 303)

  } catch (error) {
    console.error("SSLCommerz Cancel Error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/checkout?error=internal_error`, 303)
  }
}
