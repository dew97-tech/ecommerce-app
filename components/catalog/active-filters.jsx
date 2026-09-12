"use client";

import { AVAILABILITY_OPTIONS } from "@/lib/catalog/query";
import { X } from "lucide-react";
import { attributeParamKey, listParam, useFilterNavigation } from "./filter-utils";

function formatPrice(value) {
  return `৳${Number(value || 0).toLocaleString("en-US")}`;
}

export function ActiveFilters({ facets }) {
  const { apply, clearAll, searchParams } = useFilterNavigation();

  const chips = [];

  for (const value of listParam(searchParams, "brands")) {
    chips.push({ key: "brands", value, label: value });
  }

  for (const value of listParam(searchParams, "availability")) {
    const option = AVAILABILITY_OPTIONS.find((entry) => entry.value === value);
    chips.push({ key: "availability", value, label: option?.label ?? value });
  }

  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  if (minPrice || maxPrice) {
    chips.push({
      key: "price",
      price: true,
      label: `${formatPrice(minPrice)} – ${formatPrice(
        maxPrice ?? facets?.price?.max ?? 0
      )}`,
    });
  }

  for (const group of facets?.attributes ?? []) {
    const paramKey = attributeParamKey(group.attributeKey);
    for (const value of listParam(searchParams, paramKey)) {
      chips.push({ key: paramKey, value, label: `${group.label}: ${value}` });
    }
  }

  if (chips.length === 0) return null;

  const removeChip = (chip) => {
    if (chip.price) {
      apply({ min_price: null, max_price: null });
      return;
    }

    const current = listParam(searchParams, chip.key);
    apply({ [chip.key]: current.filter((value) => value !== chip.value) });
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value ?? "price"}`}
          type="button"
          onClick={() => removeChip(chip)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          {chip.label}
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      ))}

      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-medium text-primary hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
