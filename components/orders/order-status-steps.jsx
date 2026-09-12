import { cn } from "@/lib/utils"
import {
  Check,
  CircleAlert,
  CircleDashed,
  PackageCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react"
import { Fragment } from "react"

const ORDER_STEPS = [
  { key: "PENDING", label: "Placed", icon: ShoppingBag },
  { key: "PROCESSING", label: "Processing", icon: CircleDashed },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: PackageCheck },
]

export function OrderStatusSteps({ status, cancellationReason, cancellationNote }) {
  if (status === "CANCELLED" || status === "FAILED") {
    const isCancelled = status === "CANCELLED"
    const Icon = isCancelled ? XCircle : CircleAlert

    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
          isCancelled
            ? "border-border bg-muted/50 text-muted-foreground"
            : "border-destructive/30 bg-destructive/5 text-destructive"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p>
            {isCancelled
              ? "This order was cancelled."
              : "This order could not be completed."}
          </p>
          {isCancelled && (cancellationReason || cancellationNote) && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {cancellationReason}
              {cancellationReason && cancellationNote ? " — " : ""}
              {cancellationNote}
            </p>
          )}
        </div>
      </div>
    )
  }

  const currentIndex = Math.max(
    0,
    ORDER_STEPS.findIndex((step) => step.key === status)
  )

  return (
    <ol className="flex items-start">
      {ORDER_STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        const Icon = step.icon

        return (
          <Fragment key={step.key}>
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "mt-3.5 h-0.5 flex-1 rounded-full",
                  index <= currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <li className="flex w-16 shrink-0 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  !isDone && !isCurrent && "border-border text-muted-foreground"
                )}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
