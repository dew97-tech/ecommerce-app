import { CategoriesExplorer } from "@/components/catalog/categories-explorer";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config";
import { getCategorySubtreeCounts } from "@/lib/catalog/categories";

export const metadata = {
  title: "Categories",
  description:
    "Browse every computer components, laptop, gaming, networking and tech category at RigNexus.",
};

export const dynamic = "force-dynamic";

const loadCategoryOverview = unstable_cache(
  async () => {
    const [roots, totalProducts] = await Promise.all([
      db.category.findMany({
        where: { parentId: null },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          children: {
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
            },
          },
        },
      }),
      db.product.count({
        where: { isActive: true, availabilityStatus: "IN_STOCK" },
      }),
    ]);

    return { roots, totalProducts };
  },
  ["category-overview"],
  {
    tags: [CACHE_TAGS.categories, CACHE_TAGS.products],
    revalidate: staggeredTtl(CACHE_TTL.categories),
  }
);

export default async function CategoriesPage() {
  const [{ roots, totalProducts }, subtreeCounts] = await Promise.all([
    loadCategoryOverview(),
    getCategorySubtreeCounts(),
  ]);

  const departments = roots
    .map((root) => {
      const children = root.children
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          image: child.image,
          productCount: subtreeCounts.get(child.id) ?? 0,
        }))
        .sort((a, b) => b.productCount - a.productCount);

      const totalCount = subtreeCounts.get(root.id) ?? 0;

      return {
        id: root.id,
        name: root.name,
        slug: root.slug,
        image: root.image,
        productCount: totalCount,
        totalCount,
        children,
      };
    })
    .sort((a, b) => b.totalCount - a.totalCount);

  const categoryCount =
    departments.reduce((sum, department) => sum + department.children.length, 0) +
    departments.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Browse Categories
          </h1>
          <p className="mt-2 text-muted-foreground">
            {departments.length} departments · {categoryCount} categories ·{" "}
            {totalProducts.toLocaleString("en-US")} products
          </p>
        </header>

        <CategoriesExplorer
          departments={departments}
          categoryCount={categoryCount}
        />
      </div>
    </div>
  );
}
