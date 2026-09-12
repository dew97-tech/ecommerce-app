import { ActiveFilters } from "@/components/catalog/active-filters";
import { CategoryTile } from "@/components/catalog/category-tile";
import { CatalogPagination } from "@/components/catalog/pagination";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { ListingToolbar } from "@/components/catalog/listing-toolbar";
import { SubcategoryTiles } from "@/components/catalog/subcategory-tiles";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config";
import {
  getCategorySubtreeCounts,
  getCategorySubtreeIds,
} from "@/lib/catalog/categories";
import { getListingFacets } from "@/lib/catalog/facets";
import { getListingResults } from "@/lib/catalog/listing";
import {
  buildOrderBy,
  buildProductWhere,
  parseListingParams,
} from "@/lib/catalog/query";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/structured-data";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

export const dynamic = "force-dynamic";

const loadCategory = unstable_cache(
  async (id) =>
    db.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
        children: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
  ["category-detail"],
  {
    tags: [CACHE_TAGS.categories],
    revalidate: staggeredTtl(CACHE_TTL.categories),
  }
);

const getCategory = cache(loadCategory);

export async function generateMetadata({ params }) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    return {
      title: "Category not found",
      robots: { index: false, follow: false },
    };
  }

  const subtreeIds = await getCategorySubtreeIds(id);
  const productCount = await db.product.count({
    where: {
      categoryId: { in: subtreeIds },
      isActive: true,
      availabilityStatus: "IN_STOCK",
    },
  });

  const description = `Shop ${category.name} in Bangladesh at RigNexus — ${productCount.toLocaleString(
    "en-US"
  )} products with genuine warranty, EMI options and nationwide delivery.`;

  return {
    title: `${category.name} Price in Bangladesh`,
    description,
    alternates: { canonical: `/categories/${id}` },
    robots:
      productCount > 0
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      type: "website",
      title: `${category.name} — RigNexus`,
      description,
      url: `/categories/${id}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  const listing = parseListingParams(resolvedSearchParams);
  const subtreeIds = await getCategorySubtreeIds(id);
  const where = buildProductWhere({ ...listing, categoryIds: subtreeIds });
  const contextWhere = buildProductWhere({
    categoryIds: subtreeIds,
    search: listing.search,
  });

  const [{ products, totalCount }, facets, subtreeCounts] = await Promise.all([
    getListingResults({
      where,
      orderBy: buildOrderBy(listing.sort),
      skip: listing.skip,
      take: listing.limit,
    }),
    getListingFacets({
      contextWhere,
      availability: listing.availability,
      categoryName: category.name,
      rootName: category.parent?.name ?? category.name,
    }),
    getCategorySubtreeCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / listing.limit));

  const subcategories = category.children.map((child) => ({
    ...child,
    productCount: subtreeCounts.get(child.id) ?? 0,
  }));

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    ...(category.parent
      ? [{ name: category.parent.name, path: `/categories/${category.parent.id}` }]
      : []),
    { name: category.name, path: `/categories/${id}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      {products.length > 0 && (
        <JsonLd
          data={itemListSchema({
            name: `${category.name} products`,
            items: products.map((product) => ({
              url: `/products/${product.slug}`,
              name: product.name,
            })),
          })}
        />
      )}

      <nav
        className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/categories" className="transition-colors hover:text-primary">
          Categories
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {category.parent && (
          <>
            <Link
              href={`/categories/${category.parent.id}`}
              className="transition-colors hover:text-primary"
            >
              {category.parent.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="font-medium text-foreground">{category.name}</span>
      </nav>

      <div className="mb-6 flex items-center gap-4">
        <CategoryTile
          name={category.name}
          image={category.image}
          className="h-16 w-16"
          iconClassName="h-7 w-7"
          sizes="64px"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {category.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount.toLocaleString("en-US")} products in this category
          </p>
        </div>
      </div>

      <SubcategoryTiles items={subcategories} />

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
                href={`/categories/${id}`}
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
