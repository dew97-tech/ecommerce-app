import { CategoryTile, isCategoryTile } from "@/components/catalog/category-tile";
import Link from "next/link";

export function SubcategoryTiles({ items = [] }) {
  if (items.length === 0) return null;

  const hasTiles = items.some((item) => isCategoryTile(item.image));

  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Browse by subcategory
      </p>

      {hasTiles ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/categories/${item.id}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <CategoryTile
                name={item.name}
                image={item.image}
                className="h-10 w-10"
                iconClassName="h-5 w-5"
                sizes="40px"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary">
                  {item.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {item.productCount ?? item._count?.products ?? 0} products
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/categories/${item.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
            >
              {item.name}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                {item.productCount ?? item._count?.products ?? 0}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
