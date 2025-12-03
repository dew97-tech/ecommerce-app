import { db } from "@/lib/db"
import { sslcommerz } from "@/lib/sslcommerz"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const formData = await req.formData()
    const data = Object.fromEntries(formData)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const { val_id } = data

    if (!val_id) {
       return NextResponse.redirect(`${baseUrl}/checkout?error=invalid_validation_id`, 303)
    }

    const validationResponse = await sslcommerz.validate({ val_id })

    if (validationResponse?.status === 'VALID' || validationResponse?.status === 'VALIDATED') {
      const { 
        tran_id, 
        amount, 
        card_type, 
        card_no, 
        card_issuer, 
        card_brand, 
        card_issuer_country, 
        risk_level, 
        risk_title,
        bank_tran_id
      } = validationResponse

      await db.order.update({
        where: { id: tran_id },
        data: {
          status: 'PROCESSING',
          paymentStatus: 'PAID',
          valId: val_id,
          transactionId: tran_id,
          bankTranId: bank_tran_id,
          cardType: card_type,
          cardNo: card_no,
          cardIssuer: card_issuer,
          cardBrand: card_brand,
          riskLevel: risk_level ? parseInt(risk_level) : 0,
          riskTitle: risk_title
        }
      })

      return NextResponse.redirect(`${baseUrl}/order-success`, 303)
    } else {
       // Validation failed
       await db.order.update({
        where: { id: data.tran_id },
        data: {
          status: 'FAILED',
          paymentStatus: 'FAILED',
          valId: val_id
        }
      })
      return NextResponse.redirect(`${baseUrl}/checkout?error=validation_failed`, 303)
    }

  } catch (error) {
    console.error("SSLCommerz Success Error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/checkout?error=internal_error`, 303)
  }
}
