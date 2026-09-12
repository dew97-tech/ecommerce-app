import { ActiveFilters } from "@/components/catalog/active-filters";
import { CatalogPagination } from "@/components/catalog/pagination";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { ListingToolbar } from "@/components/catalog/listing-toolbar";
import { ProductCard } from "@/components/product/product-card";
import { getListingFacets } from "@/lib/catalog/facets";
import { getListingResults } from "@/lib/catalog/listing";
import {
  buildOrderBy,
  buildProductWhere,
  parseListingParams,
} from "@/lib/catalog/query";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Products",
  description:
    "Browse every computer component, laptop, gaming gear and accessory available at RigNexus with live prices and stock.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const listing = parseListingParams(resolvedSearchParams);

  const where = buildProductWhere(listing);
  const contextWhere = buildProductWhere({
    categoryId: listing.categoryId,
    search: listing.search,
  });

  const [{ products, totalCount }, facets] = await Promise.all([
    getListingResults({
      where,
      orderBy: buildOrderBy(listing.sort),
      skip: listing.skip,
      take: listing.limit,
    }),
    getListingFacets({ contextWhere, availability: listing.availability }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / listing.limit));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {listing.search ? `Search results for “${listing.search}”` : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount.toLocaleString("en-US")} products found
        </p>
      </div>

      <ListingToolbar totalCount={totalCount} facets={facets} />
      <ActiveFilters facets={facets} />

      <div className="flex gap-8">
        <FilterSidebar facets={facets} />

        <div className="flex min-w-0 flex-1 flex-col">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No products match the selected filters.
              </p>
              <Link
                href="/products"
                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                Clear all filters
              </Link>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-auto pt-12">
              <CatalogPagination
                page={listing.page}
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
