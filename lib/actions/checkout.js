'use server'

import { requireUser } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { db } from "@/lib/db"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const orderSchema = z.object({
  district: z.string().min(1, "District is required"),
  thana: z.string().min(1, "Thana is required"),
  street: z.string().min(1, "Street address is required"),
  phone: z.string().regex(/^\+880\d{10}$/, "Invalid BD phone number (e.g., +88017...)"),
  items: z.string().min(1, "Cart is empty"),
  paymentMethod: z.enum(["COD", "SSLCOMMERZ"]).optional(),
})

const cartItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
})

class CheckoutError extends Error {}

export async function placeOrder(prevState, formData) {
  let user
  try {
    user = await requireUser()
  } catch {
    return { message: "Please log in to place an order." }
  }

  const validatedFields = orderSchema.safeParse({
    district: formData.get("district"),
    thana: formData.get("thana"),
    street: formData.get("street"),
    phone: formData.get("phone"),
    items: formData.get("items"),
    paymentMethod: formData.get("paymentMethod"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    }
  }

  const { district, thana, street, phone, items, paymentMethod } = validatedFields.data

  let cartItems
  try {
    const parsed = JSON.parse(items)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { message: "Your cart is empty." }
    }
    cartItems = parsed.map((item) => cartItemSchema.parse(item))
  } catch {
    return { message: "Invalid cart data. Please refresh and try again." }
  }

  let order
  try {
    order = await db.$transaction(async (tx) => {
      const orderItems = []

      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: { id: true, name: true, price: true, discountedPrice: true, stock: true },
        })

        if (!product) {
          throw new CheckoutError("One of the items in your cart is no longer available.")
        }

        const updated = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })

        if (updated.count === 0) {
          throw new CheckoutError(`Not enough stock available for "${product.name}".`)
        }

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: product.discountedPrice ?? product.price,
        })
      }

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.priceAtPurchase * item.quantity,
        0
      )

      return tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          status: "PENDING",
          paymentMethod: paymentMethod || "COD",
          shippingAddress: `${street}, ${thana}, ${district}. Phone: ${phone}`,
          orderItems: { create: orderItems },
        },
      })
    })
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { message: error.message }
    }
    console.error("Place order error:", error)
    return { message: "Failed to place order. Please try again." }
  }

  revalidatePath("/orders")
  revalidateTag(CACHE_TAGS.products, "max")

  if (paymentMethod === "SSLCOMMERZ") {
    return { success: true, orderId: order.id, paymentMethod: "SSLCOMMERZ" }
  }

  redirect("/order-success")
}
