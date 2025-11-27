import { StarRating } from "@/components/reviews/star-rating"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        No reviews yet. Be the first to review this product!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar>
                <AvatarFallback>{review.user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{review.user.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={review.rating} readOnly />
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-14">
            {review.comment}
          </p>
          <Separator />
        </div>
      ))}
    </div>
  )
}
