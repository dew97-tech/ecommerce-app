import { UserAvatar } from "@/components/common/user-avatar"
import { StarRating } from "@/components/reviews/star-rating"

export function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 py-12 text-center text-muted-foreground">
        No reviews yet. Be the first to review this product!
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="flex gap-3 py-5 first:pt-0 last:pb-0"
        >
          <UserAvatar
            name={review.user.name}
            image={review.user.image}
            className="h-9 w-9"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {review.user.name}
              </p>
              <time
                className="text-xs text-muted-foreground"
                dateTime={new Date(review.createdAt).toISOString()}
              >
                {new Date(review.createdAt).toLocaleDateString("en-US")}
              </time>
            </div>

            <div className="mt-1">
              <StarRating rating={review.rating} readOnly />
            </div>

            {review.comment && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {review.comment}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
