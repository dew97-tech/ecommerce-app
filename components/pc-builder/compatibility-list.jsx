"use client";

import { cn } from "@/lib/utils";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

export function CompatibilityList({ issues = [] }) {
  if (issues.length === 0) return null;

  return (
    <div className="space-y-2">
      {issues.map((issue) => {
        const isBlocker = issue.level === "blocker";
        const isInfo = issue.level === "info";

        return (
          <div
            key={`${issue.code}-${issue.message}`}
            className={cn(
              "flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed",
              isInfo
                ? "border-border bg-muted/30 text-muted-foreground"
                : isBlocker
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : "border-warning/30 bg-warning/5 text-foreground"
            )}
          >
            {isInfo ? (
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
            ) : isBlocker ? (
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            )}
            <span>{issue.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export function CompatibilitySuccess() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-xs text-success">
      <CircleCheck className="h-4 w-4 shrink-0" />
      No compatibility issues detected for the selected parts.
    </div>
  );
}
