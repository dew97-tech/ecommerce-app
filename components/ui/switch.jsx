"use client"

import { cn } from "@/lib/utils"

export function Switch({
  checked = false,
  onCheckedChange,
  className,
  label,
  ...props
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-muted-foreground/30",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute h-4 w-4 rounded-full bg-white shadow transition-[left] duration-200",
          checked ? "left-[18px]" : "left-0.5"
        )}
      />
    </button>
  )
}
