'use server'

import { requireUser } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { db } from "@/lib/db"
import { deductItemsStock } from "@/lib/orders/stock"
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
  checkoutToken: z.string().min(1, "Invalid checkout session"),
})

const cartItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
})

class CheckoutError extends Error {}

function paymentResult(order) {
  if (order.paymentMethod === "SSLCOMMERZ") {
    return { success: true, orderId: order.id, paymentMethod: "SSLCOMMERZ" }
  }
  redirect("/order-success")
}

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
    checkoutToken: formData.get("checkoutToken"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    }
  }

  const { district, thana, street, phone, items, paymentMethod, checkoutToken } = validatedFields.data

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

  const quantityByProduct = new Map()
  for (const item of cartItems) {
    quantityByProduct.set(
      item.id,
      (quantityByProduct.get(item.id) ?? 0) + item.quantity
    )
  }
  const normalizedItems = [...quantityByProduct.entries()].map(([id, quantity]) => ({
    id,
    quantity,
  }))

  const existingOrder = await db.order.findUnique({ where: { checkoutToken } })
  if (existingOrder) {
    if (existingOrder.userId !== user.id) {
      return { message: "This checkout session is no longer valid. Please refresh and try again." }
    }
    return paymentResult(existingOrder)
  }

  let order
  try {
    order = await db.$transaction(async (tx) => {
      const orderItems = []
      const stockItems = []

      for (const item of normalizedItems) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: {
            id: true,
            name: true,
            price: true,
            discountedPrice: true,
            stock: true,
            isActive: true,
            availabilityStatus: true,
          },
        })

        if (!product || !product.isActive) {
          throw new CheckoutError("One of the items in your cart is no longer available.")
        }

        if (product.availabilityStatus === "OUT_OF_STOCK" || product.stock < item.quantity) {
          throw new CheckoutError(
            `Not enough stock for "${product.name}". Only ${product.stock} left.`
          )
        }

        stockItems.push({
          productId: product.id,
          quantity: item.quantity,
          name: product.name,
        })
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: product.discountedPrice ?? product.price,
        })
      }

      try {
        await deductItemsStock(tx, stockItems)
      } catch (stockError) {
        throw new CheckoutError(stockError.message)
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
          checkoutToken,
          orderItems: { create: orderItems },
        },
      })
    })
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { message: error.message }
    }
    if (error?.code === "P2002") {
      const duplicate = await db.order.findUnique({ where: { checkoutToken } })
      if (duplicate && duplicate.userId === user.id) {
        return paymentResult(duplicate)
      }
      return { message: "This checkout was already submitted. Please refresh and try again." }
    }
    console.error("Place order error:", error)
    return { message: "Failed to place order. Please try again." }
  }

  revalidatePath("/orders")
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
  revalidateTag(CACHE_TAGS.products, "max")

  return paymentResult(order)
}
