import { auth } from "@/auth"
import { db } from "@/lib/db"
import { sslcommerz } from "@/lib/services/sslcommerz"
import { NextResponse } from "next/server"

export async function POST(req) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { orderId } = await req.json()

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ message: "Invalid order" }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orderItems: { include: { product: { select: { name: true } } } },
      },
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    if (order.paymentMethod !== "SSLCOMMERZ") {
      return NextResponse.json(
        { message: "This order is not eligible for online payment" },
        { status: 400 }
      )
    }

    if (order.paymentStatus === "PAID" || order.status === "CANCELLED") {
      return NextResponse.json(
        { message: "This order can no longer be paid" },
        { status: 400 }
      )
    }

    const tranId = `${order.id}-${Date.now()}`

    await db.order.update({
      where: { id: order.id },
      data: { transactionId: tranId, paymentStatus: "PENDING" },
    })

    const productNames = order.orderItems.map(item => item.product.name).join(", ")

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const data = {
      total_amount: order.totalAmount,
      currency: 'BDT',
      tran_id: tranId,
      success_url: `${baseUrl}/api/sslcommerz/success`,
      fail_url: `${baseUrl}/api/sslcommerz/fail`,
      cancel_url: `${baseUrl}/api/sslcommerz/cancel`,
      ipn_url: `${baseUrl}/api/sslcommerz/ipn`,
      shipping_method: 'Courier',
      product_name: productNames.substring(0, 255),
      product_category: 'General',
      product_profile: 'general',
      cus_name: order.user.name || 'Guest',
      cus_email: order.user.email,
      cus_add1: order.shippingAddress,
      cus_add2: order.shippingAddress,
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: order.user.phone || '01700000000',
      ship_name: order.user.name || 'Guest',
      ship_add1: order.shippingAddress,
      ship_add2: order.shippingAddress,
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    }

    const apiResponse = await sslcommerz.init(data)

    if (apiResponse?.GatewayPageURL) {
      return NextResponse.json({ url: apiResponse.GatewayPageURL })
    }

    console.error("SSLCommerz init failed:", apiResponse?.failedreason || apiResponse?.status)
    return NextResponse.json({ message: "Failed to initiate payment" }, { status: 500 })

  } catch (error) {
    console.error("SSLCommerz Init Error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
