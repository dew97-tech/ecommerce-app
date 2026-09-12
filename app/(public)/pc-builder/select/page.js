import { ActiveFilters } from "@/components/catalog/active-filters";
import { CatalogPagination } from "@/components/catalog/pagination";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { ListingToolbar } from "@/components/catalog/listing-toolbar";
import { SlotPicker } from "@/components/pc-builder/slot-picker";
import { getSlotOptions } from "@/lib/actions/pc-builder";
import { firstParam } from "@/lib/catalog/query";
import { getSlotDefinition } from "@/lib/pc-builder/slots";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SlotPickerPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const slot = getSlotDefinition(firstParam(resolvedSearchParams.slot));

  if (!slot) {
    redirect("/pc-builder");
  }

  const options = await getSlotOptions(slot.key, resolvedSearchParams);

  if (options.error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">{options.error}</p>
        <Link
          href="/pc-builder"
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to PC Builder
        </Link>
      </div>
    );
  }

  const facets = options.facets;
  const totalPages = options.totalPages ?? 1;
  const page = Math.max(1, Number(firstParam(resolvedSearchParams.page)) || 1);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/pc-builder" className="transition-colors hover:text-primary">
          PC Builder
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{slot.label}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Choose {slot.label}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {options.totalCount.toLocaleString("en-US")} products available
        </p>
      </div>

      <ListingToolbar totalCount={options.totalCount} facets={facets} />
      <ActiveFilters facets={facets} />

      <div className="flex gap-8">
        <FilterSidebar facets={facets} />

        <div className="flex min-w-0 flex-1 flex-col">
          <SlotPicker
            slotKey={slot.key}
            slotLabel={slot.label}
            products={options.products}
          />

          {totalPages > 1 && (
            <div className="mt-auto pt-12">
              <CatalogPagination
                page={page}
                totalPages={totalPages}
                searchParams={resolvedSearchParams}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
