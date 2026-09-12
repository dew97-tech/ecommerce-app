"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_AVAILABILITY } from "@/lib/catalog/query";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { attributeParamKey, listParam, useFilterNavigation } from "./filter-utils";

const VISIBLE_OPTIONS = 8;
const VISIBLE_BRANDS = 10;

function FilterSection({ title, appliedCount = 0, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-border py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {title}
          {appliedCount > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {appliedCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="pt-3">{children}</div>}
    </section>
  );
}

function checkboxId(prefix, value) {
  return `${prefix}-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function CheckboxList({ idPrefix, options, selected, onToggle, initialVisible }) {
  const [expanded, setExpanded] = useState(false);
  const visibleLimit = initialVisible ?? VISIBLE_OPTIONS;
  const visible = expanded ? options : options.slice(0, visibleLimit);

  if (options.length === 0) {
    return <p className="text-xs text-muted-foreground">No options available.</p>;
  }

  return (
    <div className="space-y-1.5">
      {visible.map((option) => {
        const id = checkboxId(idPrefix, option.value);
        const checked = selected.includes(option.value);

        return (
          <div key={option.value} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => onToggle(option.value)}
              />
              <Label
                htmlFor={id}
                className="cursor-pointer truncate text-sm font-normal text-foreground"
                title={option.value}
              >
                {option.label ?? option.value}
              </Label>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {option.count}
            </span>
          </div>
        );
      })}

      {options.length > visibleLimit && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className=" pt-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : `Show ${options.length - visibleLimit} more`}
        </button>
      )}
    </div>
  );
}

function PriceRange({ min, max, appliedMin, appliedMax }) {
  const { apply } = useFilterNavigation();
  const floor = Math.floor(Math.min(min ?? 0, appliedMin ?? min ?? 0));
  const ceiling = Math.ceil(Math.max(max ?? 0, appliedMax ?? max ?? 0));
  const hasRange = ceiling > floor;

  const [range, setRange] = useState([
    appliedMin ?? floor,
    appliedMax ?? ceiling,
  ]);

  const span = Math.max(1, ceiling - floor);
  const step =
    span > 100000 ? 1000 : span > 10000 ? 500 : span > 1000 ? 100 : span > 100 ? 10 : 1;

  const commit = (nextRange) => {
    const low = Math.min(nextRange[0], nextRange[1]);
    const high = Math.max(nextRange[0], nextRange[1]);
    apply({
      min_price: low <= floor ? null : low,
      max_price: high >= ceiling ? null : high,
    });
  };

  if (!hasRange) return null;

  return (
    <div className="space-y-3">
      <Slider
        value={range}
        min={floor}
        max={ceiling}
        step={step}
        onValueChange={setRange}
        onValueCommit={commit}
        aria-label="Price range"
      />

      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          value={range[0]}
          onChange={(event) =>
            setRange([Number(event.target.value) || 0, range[1]])
          }
          className="h-8 min-w-0 flex-1 text-sm"
          aria-label="Minimum price"
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          inputMode="numeric"
          value={range[1]}
          onChange={(event) =>
            setRange([range[0], Number(event.target.value) || 0])
          }
          className="h-8 min-w-0 flex-1 text-sm"
          aria-label="Maximum price"
        />
        <Button type="button" size="sm" variant="outline" onClick={() => commit(range)}>
          Go
        </Button>
      </div>
    </div>
  );
}

export function FilterSections({ facets }) {
  const { apply, searchParams } = useFilterNavigation();
  const [brandQuery, setBrandQuery] = useState("");

  const selectedBrands = listParam(searchParams, "brands");
  const selectedAvailability = listParam(searchParams, "availability");
  const effectiveAvailability = selectedAvailability.length
    ? selectedAvailability
    : DEFAULT_AVAILABILITY;
  const appliedMin = searchParams.get("min_price");
  const appliedMax = searchParams.get("max_price");
  const priceActive = appliedMin !== null || appliedMax !== null;

  const toggleListValue = (paramKey, value) => {
    const current = listParam(searchParams, paramKey);
    const next = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];
    apply({ [paramKey]: next });
  };

  const toggleAvailability = (value) => {
    const next = effectiveAvailability.includes(value)
      ? effectiveAvailability.filter((entry) => entry !== value)
      : [...effectiveAvailability, value];
    apply({ availability: next });
  };

  const filteredBrands = brandQuery
    ? facets.brands.filter((brand) =>
        brand.value.toLowerCase().includes(brandQuery.toLowerCase())
      )
    : facets.brands;

  return (
    <div>
      {facets.availability.length > 0 && (
        <FilterSection
          title="Availability"
          appliedCount={effectiveAvailability.length}
        >
          <CheckboxList
            idPrefix="availability"
            options={facets.availability}
            selected={effectiveAvailability}
            onToggle={toggleAvailability}
          />
        </FilterSection>
      )}

      <FilterSection title="Price" appliedCount={priceActive ? 1 : 0}>
        <PriceRange
          key={`${appliedMin}-${appliedMax}-${facets.price.min}-${facets.price.max}`}
          min={facets.price.min}
          max={facets.price.max}
          appliedMin={appliedMin !== null ? Number(appliedMin) : null}
          appliedMax={appliedMax !== null ? Number(appliedMax) : null}
        />
      </FilterSection>

      {facets.brands.length > 0 && (
        <FilterSection title="Brand" appliedCount={selectedBrands.length}>
          {facets.brands.length > 8 && (
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={brandQuery}
                onChange={(event) => setBrandQuery(event.target.value)}
                placeholder="Search brands"
                className="h-8 pl-8 text-sm"
                aria-label="Search brands"
              />
            </div>
          )}
          <CheckboxList
            idPrefix="brand"
            options={filteredBrands}
            selected={selectedBrands}
            onToggle={(value) => toggleListValue("brands", value)}
            initialVisible={VISIBLE_BRANDS}
          />
        </FilterSection>
      )}

      {facets.attributes.map((group) => {
        const paramKey = attributeParamKey(group.attributeKey);
        const selected = listParam(searchParams, paramKey);

        return (
          <FilterSection
            key={group.id}
            title={group.label}
            appliedCount={selected.length}
          >
            <CheckboxList
              idPrefix={group.id}
              options={group.options}
              selected={selected}
              onToggle={(value) => toggleListValue(paramKey, value)}
            />
          </FilterSection>
        );
      })}
    </div>
  );
}
