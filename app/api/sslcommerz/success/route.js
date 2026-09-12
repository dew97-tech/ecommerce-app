import { db } from "@/lib/db"
import { sslcommerz } from "@/lib/services/sslcommerz"
import { NextResponse } from "next/server"

export async function POST(req) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const formData = await req.formData()
    const data = Object.fromEntries(formData)

    const { val_id } = data

    if (!val_id) {
      return NextResponse.redirect(`${baseUrl}/checkout?error=invalid_validation_id`, 303)
    }

    const validationResponse = await sslcommerz.validate({ val_id })

    if (!validationResponse || (validationResponse.status !== 'VALID' && validationResponse.status !== 'VALIDATED')) {
      return NextResponse.redirect(`${baseUrl}/checkout?error=validation_failed`, 303)
    }

    const { tran_id, amount, currency } = validationResponse

    const order = await db.order.findUnique({ where: { transactionId: tran_id } })

    if (!order) {
      return NextResponse.redirect(`${baseUrl}/checkout?error=order_not_found`, 303)
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.redirect(`${baseUrl}/order-success`, 303)
    }

    const amountMatches = Math.abs(Number(amount) - order.totalAmount) < 0.01
    const currencyMatches = (currency || 'BDT') === 'BDT'

    if (!amountMatches || !currencyMatches) {
      await db.order.update({
        where: { id: order.id },
        data: { status: 'FAILED', paymentStatus: 'FAILED', valId: val_id },
      })
      console.error(`Payment mismatch for order ${order.id}: expected ${order.totalAmount} BDT, got ${amount} ${currency}`)
      return NextResponse.redirect(`${baseUrl}/checkout?error=payment_mismatch`, 303)
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        valId: val_id,
        bankTranId: validationResponse.bank_tran_id,
        cardType: validationResponse.card_type,
        cardNo: validationResponse.card_no,
        cardIssuer: validationResponse.card_issuer,
        cardBrand: validationResponse.card_brand,
        riskLevel: validationResponse.risk_level ? parseInt(validationResponse.risk_level) : 0,
        riskTitle: validationResponse.risk_title,
      },
    })

    return NextResponse.redirect(`${baseUrl}/order-success`, 303)

  } catch (error) {
    console.error("SSLCommerz Success Error:", error)
    return NextResponse.redirect(`${baseUrl}/checkout?error=internal_error`, 303)
  }
}
