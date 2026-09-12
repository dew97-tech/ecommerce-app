"use client"

import { UserAvatar } from "@/components/common/user-avatar"
import { StarRating } from "@/components/reviews/star-rating"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addReview } from "@/lib/actions/review"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

export function AddReviewForm({ productId }) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData) {
    if (!session) {
      toast.error("Please login to review")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)
    formData.append("rating", rating)

    try {
      await addReview(productId, formData)
      toast.success("Review submitted!")
      setRating(0)
      document.getElementById("review-form").reset()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-6 text-center">
        <p className="mb-4 text-muted-foreground">Please log in to write a review.</p>
        <Button variant="outline" asChild>
          <a href="/login">Login</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <UserAvatar
          name={session.user.name}
          image={session.user.image}
          className="h-9 w-9"
        />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">Write a Review</h3>
          <p className="truncate text-xs text-muted-foreground">
            Reviewing as {session.user.name}
          </p>
        </div>
      </div>

      <form id="review-form" action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Rating</Label>
          <StarRating rating={rating} onRatingChange={setRating} size="md" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Your Review</Label>
          <Textarea
            id="comment"
            name="comment"
            placeholder="What did you like or dislike?"
            required
            className="min-h-[100px]"
          />
        </div>

        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  )
}
