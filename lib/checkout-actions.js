'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { z } from "zod"

const orderSchema = z.object({
  district: z.string().min(1, "District is required"),
  thana: z.string().min(1, "Thana is required"),
  street: z.string().min(1, "Street address is required"),
  phone: z.string().regex(/^\+880\d{10}$/, "Invalid BD phone number (e.g., +88017...)"),
  items: z.string(),
  totalAmount: z.coerce.number(),
})

export async function placeOrder(prevState, formData) {
  const session = await auth()
  if (!session) return { message: "Unauthorized" }

  const validatedFields = orderSchema.safeParse({
    district: formData.get("district"),
    thana: formData.get("thana"),
    street: formData.get("street"),
    phone: formData.get("phone"),
    items: formData.get("items"),
    totalAmount: formData.get("totalAmount"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    }
  }

  const { district, thana, street, phone, items, totalAmount } = validatedFields.data
  const cartItems = JSON.parse(items)

  try {
    await db.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        status: 'PENDING',
        paymentMethod: 'COD',
        shippingAddress: `${street}, ${thana}, ${district}. Phone: ${phone}`,
        orderItems: {
          create: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            priceAtPurchase: item.price
          }))
        }
      }
    })
  } catch (error) {
    console.error(error)
    return { message: "Failed to place order. Please try again." }
  }

  redirect("/order-success")
}
