import { db } from "@/lib/db"
import { sslcommerz } from "@/lib/services/sslcommerz"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const formData = await req.formData()
    const data = Object.fromEntries(formData)

    const { val_id } = data

    if (!val_id) {
      return NextResponse.json({ message: "Missing val_id" }, { status: 400 })
    }

    const validationResponse = await sslcommerz.validate({ val_id })

    if (!validationResponse || (validationResponse.status !== 'VALID' && validationResponse.status !== 'VALIDATED')) {
      return NextResponse.json({ message: "Invalid transaction" }, { status: 400 })
    }

    const { tran_id, amount, currency } = validationResponse

    const order = await db.order.findUnique({ where: { transactionId: tran_id } })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ received: true })
    }

    const amountMatches = Math.abs(Number(amount) - order.totalAmount) < 0.01
    const currencyMatches = (currency || 'BDT') === 'BDT'

    if (order.status === 'CANCELLED') {
      if (amountMatches && currencyMatches) {
        await db.order.update({
          where: { id: order.id },
          data: {
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
      }

      return NextResponse.json({ received: true })
    }

    if (!amountMatches || !currencyMatches) {
      await db.order.update({
        where: { id: order.id },
        data: { status: 'FAILED', paymentStatus: 'FAILED', valId: val_id },
      })
      console.error(`IPN payment mismatch for order ${order.id}: expected ${order.totalAmount} BDT, got ${amount} ${currency}`)
      return NextResponse.json({ message: "Amount mismatch" }, { status: 400 })
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

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("SSLCommerz IPN Error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
