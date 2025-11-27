"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addReview(productId, formData) {
  const session = await auth()
  if (!session) {
    throw new Error("You must be logged in to review")
  }

  const rating = parseInt(formData.get("rating"))
  const comment = formData.get("comment")

  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Invalid rating")
  }

  // Check if user already reviewed this product
  const existingReview = await db.review.findFirst({
    where: {
      userId: session.user.id,
      productId: productId,
    },
  })

  if (existingReview) {
    throw new Error("You have already reviewed this product")
  }

  await db.review.create({
    data: {
      rating,
      comment,
      productId,
      userId: session.user.id,
    },
  })

  revalidatePath(`/products/${productId}`)
  revalidatePath(`/products`) // If we show ratings on cards
}

export async function deleteReview(reviewId) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const review = await db.review.findUnique({
    where: { id: reviewId },
  })

  if (!review) throw new Error("Review not found")

  if (session.user.role !== "ADMIN" && review.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  await db.review.delete({
    where: { id: reviewId },
  })

  revalidatePath("/admin/reviews")
  // We can't easily revalidate the specific product page without fetching the review first, 
  // but for admin actions, revalidating the admin list is key. 
  // If user deletes their own, we might want to revalidate the product page.
  // Since we don't have the product ID here easily without another DB call (which we did above),
  // let's revalidate the product page too.
  revalidatePath(`/products/${review.productId}`)
}
