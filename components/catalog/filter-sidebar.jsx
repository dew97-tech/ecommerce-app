"use client";

import { cn } from "@/lib/utils";
import { FilterSections } from "./filter-sections";

export function FilterSidebar({ facets, className }) {
  return (
    <aside className={cn("hidden w-64 shrink-0 lg:block", className)}>
      <div className="thin-scrollbar sticky top-20 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border bg-card px-5 py-2">
        <FilterSections facets={facets} />
      </div>
    </aside>
  );
}
