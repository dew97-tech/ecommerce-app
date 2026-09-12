'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatAdminDateTime, formatCancelledBy } from "@/lib/format"
import { MessageSquareWarning } from "lucide-react"

export function CancellationInfo({ reason, note, cancelledBy, cancelledAt }) {
  const lines = [
    formatCancelledBy(cancelledBy),
    reason,
    note,
    cancelledAt ? formatAdminDateTime(cancelledAt) : null,
  ].filter(Boolean)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Cancellation details: ${lines.join(". ")}`}
        >
          <MessageSquareWarning className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-0.5">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
