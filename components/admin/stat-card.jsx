import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const TONES = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

function CardContent({ label, value, icon: Icon, hint, trend, tone }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              TONES[tone] ?? TONES.default
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      {typeof trend === "number" && (
        <p className="mt-2 flex items-center gap-1 text-xs">
          {trend >= 0 ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-success" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
          )}
          <span className={trend >= 0 ? "text-success" : "text-destructive"}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">vs previous 30 days</span>
        </p>
      )}

      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
}

export function StatCard({ href, className, ...props }) {
  const base = cn(
    "block rounded-xl border border-border bg-card p-4 transition-colors",
    href && "hover:border-primary/40",
    className
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        <CardContent {...props} />
      </Link>
    );
  }

  return (
    <div className={base}>
      <CardContent {...props} />
    </div>
  );
}
