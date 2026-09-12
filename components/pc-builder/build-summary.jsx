"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Link2, ShoppingCart, Trash2 } from "lucide-react";
import { CompatibilityList, CompatibilitySuccess } from "./compatibility-list";
import { WattageMeter } from "./wattage-meter";

export function BuildSummary({
  build,
  isLoading,
  selectedCount,
  requiredCount,
  requiredSelected,
  totalSlots = 14,
  isCopied,
  isSubmitting,
  onClear,
  onAddToCart,
  onDownload,
  onShare,
}) {
  const hasItems = selectedCount > 0;
  const issues = build?.issues ?? [];
  const problems = issues.filter((issue) => issue.level !== "info");
  const notices = issues.filter((issue) => issue.level === "info");
  const hasBlockers = build?.hasBlockers ?? false;
  const showSuccess =
    hasItems && requiredSelected === requiredCount && problems.length === 0;

  return (
    <div id="build-summary">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Build summary</h2>
          <p className="text-sm text-muted-foreground">
            Parts, power and compatibility.
          </p>
        </div>
        {hasItems && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-mb-1 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onClear}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4 lg:sticky lg:top-16">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Parts selected</span>
            <span className="font-medium text-foreground">
              {selectedCount} / {totalSlots}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                requiredSelected === requiredCount ? "bg-success" : "bg-primary"
              )}
              style={{
                width: `${Math.round((selectedCount / totalSlots) * 100)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-medium text-foreground">Subtotal</span>
            <span className="text-2xl font-bold text-price">
              ৳
              {(build?.subtotal ?? 0).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>

          <WattageMeter
            wattage={build?.wattage ?? 0}
            psuWattage={build?.psuWattage ?? null}
          />

          {showSuccess ? (
            <CompatibilitySuccess />
          ) : (
            <CompatibilityList issues={problems} />
          )}

          {notices.length > 0 && <CompatibilityList issues={notices} />}
        </div>

        <div className="mt-5 space-y-2">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!hasItems || hasBlockers || isLoading || isSubmitting}
            onClick={onAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isSubmitting ? "Adding…" : "Add all to cart"}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!hasItems || isLoading}
              onClick={onDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Quotation
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!hasItems}
              onClick={onShare}
            >
              <Link2 className="mr-2 h-4 w-4" />
              {isCopied ? "Copied" : "Share"}
            </Button>
          </div>
        </div>

        {hasBlockers && (
          <p className="mt-3 text-xs text-destructive">
            Resolve the compatibility issues above before adding to cart.
          </p>
        )}

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Prices and stock are refreshed from the catalog. Final invoice may
          vary slightly with market pricing.
        </p>
        </div>
      </div>
    </div>
  );
}
