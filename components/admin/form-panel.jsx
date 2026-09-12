import { cn } from "@/lib/utils"

export function FormPanel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action && (
            <div className="flex shrink-0 items-center gap-2">{action}</div>
          )}
        </header>
      )}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  )
}
