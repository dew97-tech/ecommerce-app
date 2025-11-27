"use client"

import { cn } from "@/lib/utils"
import { Star } from "lucide-react"
import { useState } from "react"

export function StarRating({ rating, max = 5, size = "sm", onRatingChange, readOnly = false }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1
        const isFilled = (hoverRating || rating) >= starValue

        return (
          <Star
            key={i}
            className={cn(
              "transition-colors",
              size === "sm" ? "h-4 w-4" : "h-6 w-6",
              isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
              !readOnly && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            onClick={() => !readOnly && onRatingChange?.(starValue)}
          />
        )
      })}
    </div>
  )
}
