"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export function MobileSummaryBar({
  subtotal,
  selectedCount,
  disabled,
  isSubmitting,
  onAddToCart,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {selectedCount} parts selected
          </p>
          <p className="truncate text-lg font-bold text-price">
            ৳{subtotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>

        <Button
          type="button"
          disabled={disabled || isSubmitting}
          onClick={onAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isSubmitting ? "Adding…" : "Add all"}
        </Button>
      </div>
    </div>
  );
}
