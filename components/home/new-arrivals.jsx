import { ProductCard } from "@/components/product/product-card";
import Link from "next/link";

export function NewArrivals({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            New arrivals
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The latest products added to the catalog
          </p>
        </div>
        <Link
          href="/products?sort=newest"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
