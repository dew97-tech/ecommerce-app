"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS, SORT_OPTIONS } from "@/lib/catalog/query";
import { FilterDrawer } from "./filter-drawer";
import { useFilterNavigation } from "./filter-utils";

export function ListingToolbar({ totalCount = 0, facets }) {
  const { apply, searchParams } = useFilterNavigation();
  const sort = searchParams.get("sort") || "newest";
  const limit = searchParams.get("limit") || String(PAGE_SIZE_OPTIONS[0]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {totalCount.toLocaleString("en-US")}
        </span>{" "}
        products
      </p>

      <div className="flex items-center gap-2">
        <FilterDrawer facets={facets} resultCount={totalCount} />

        <Select value={limit} onValueChange={(value) => apply({ limit: value })}>
          <SelectTrigger className="h-9 w-[110px]" aria-label="Products per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => apply({ sort: value })}>
          <SelectTrigger className="h-9 w-[170px]" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
