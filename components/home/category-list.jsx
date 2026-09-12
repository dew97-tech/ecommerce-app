import { CategoryTile } from "@/components/catalog/category-tile";
import Link from "next/link";

export function CategoryList({ categories = [] }) {
  if (categories.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Shop by category
        </h2>
        <Link
          href="/categories"
          className="text-sm font-medium text-primary hover:underline"
        >
          See all categories
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
          >
            <CategoryTile
              name={category.name}
              image={category.image}
              className="aspect-square w-full"
              iconClassName="h-8 w-8"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
            />
            <div className="flex flex-1 flex-col p-3 text-center">
              <span className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-primary">
                {category.name}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {category._count?.products ?? 0} items
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
