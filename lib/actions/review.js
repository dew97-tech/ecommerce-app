"use server"

import { requireUser } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { db } from "@/lib/db"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000, "Comment is too long").optional(),
})

export async function addReview(productId, formData) {
  const user = await requireUser()

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment") ?? "",
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid review")
  }

  const limit = checkRateLimit(`review:${user.id}`, {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  })

  if (!limit.allowed) {
    throw new Error("Too many reviews. Please try again later.")
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true },
  })

  if (!product || !product.isActive) {
    throw new Error("Product not found")
  }

  const existingReview = await db.review.findFirst({
    where: {
      userId: user.id,
      productId,
    },
  })

  if (existingReview) {
    throw new Error("You have already reviewed this product")
  }

  await db.review.create({
    data: {
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
      productId,
      userId: user.id,
    },
  })

  revalidatePath(`/products/${productId}`)
  revalidatePath(`/products`)
  revalidateTag(CACHE_TAGS.reviews, "max")
}

export async function deleteReview(reviewId) {
  const user = await requireUser()

  const review = await db.review.findUnique({
    where: { id: reviewId },
  })

  if (!review) throw new Error("Review not found")

  if (user.role !== "ADMIN" && review.userId !== user.id) {
    throw new Error("Unauthorized")
  }

  await db.review.delete({
    where: { id: reviewId },
  })

  revalidatePath("/admin/reviews")
  revalidatePath(`/products/${review.productId}`)
  revalidateTag(CACHE_TAGS.reviews, "max")
}
