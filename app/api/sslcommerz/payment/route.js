import { auth } from "@/auth"
import { db } from "@/lib/db"
import { sslcommerz } from "@/lib/sslcommerz"
import { NextResponse } from "next/server"

export async function POST(req) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { orderId } = await req.json()

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: true, orderItems: { include: { product: true } } }
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Construct product names and categories
    const productNames = order.orderItems.map(item => item.product.name).join(", ")
    const productCategories = "General" 

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const data = {
      total_amount: order.totalAmount,
      currency: 'BDT',
      tran_id: order.id, // Use order ID as transaction ID
      success_url: `${baseUrl}/api/sslcommerz/success`,
      fail_url: `${baseUrl}/api/sslcommerz/fail`,
      cancel_url: `${baseUrl}/api/sslcommerz/cancel`,
      ipn_url: `${baseUrl}/api/sslcommerz/ipn`,
      shipping_method: 'Courier',
      product_name: productNames.substring(0, 255),
      product_category: productCategories,
      product_profile: 'general',
      cus_name: order.user.name || 'Guest',
      cus_email: order.user.email,
      cus_add1: order.shippingAddress,
      cus_add2: order.shippingAddress,
      cus_city: 'Dhaka', // Should be parsed from address if possible
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

    console.log("SSLCommerz Init Data:", data)
    const apiResponse = await sslcommerz.init(data)
    console.log("SSLCommerz Init Response:", apiResponse)

    if (apiResponse?.GatewayPageURL) {
      return NextResponse.json({ url: apiResponse.GatewayPageURL })
    } else {
      return NextResponse.json({ message: "Failed to initiate payment", response: apiResponse }, { status: 500 })
    }

  } catch (error) {
    console.error("SSLCommerz Init Error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
