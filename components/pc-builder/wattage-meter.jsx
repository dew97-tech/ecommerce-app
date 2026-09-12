"use client";

import { cn } from "@/lib/utils";

export function WattageMeter({ wattage = 0, psuWattage = null }) {
  const hasPsu = Boolean(psuWattage);
  const ratio = hasPsu ? wattage / psuWattage : 0;
  const percent = Math.min(100, Math.round(ratio * 100));

  const tone = !hasPsu
    ? "bg-muted-foreground/40"
    : ratio <= 0.7
      ? "bg-success"
      : ratio <= 0.9
        ? "bg-warning"
        : "bg-destructive";

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Estimated load</span>
        <span className="font-semibold text-foreground">~{wattage}W</span>
      </div>

      {hasPsu && (
        <>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", tone)}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Power supply: {psuWattage}W</span>
            <span>{percent}% used</span>
          </div>
        </>
      )}

      {!hasPsu && (
        <p className="mt-2 text-xs text-muted-foreground">
          Select a power supply to see headroom.
        </p>
      )}
    </div>
  );
}
