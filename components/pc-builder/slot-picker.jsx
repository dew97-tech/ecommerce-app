"use client";

import { Button } from "@/components/ui/button";
import { parseImages } from "@/lib/images";
import { getDiscountPercentage, getSellingPrice } from "@/lib/price";
import { cn } from "@/lib/utils";
import { usePcBuilderStore } from "@/store/usePcBuilderStore";
import { CircleCheck, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function SlotPicker({ slotKey, slotLabel, products = [] }) {
  const router = useRouter();
  const select = usePcBuilderStore((state) => state.select);
  const selectedId = usePcBuilderStore(
    (state) => state.selections[slotKey]
  );

  useEffect(() => {
    usePcBuilderStore.persist.rehydrate();
  }, []);

  const handleSelect = (product) => {
    select(slotKey, product.id);
    toast.success(`${product.name} added to your build`);
    router.push("/pc-builder");
  };

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-20 text-center">
        <p className="text-lg text-muted-foreground">
          No {slotLabel.toLowerCase()} products match the selected filters.
        </p>
        <Link
          href={`/pc-builder/select?slot=${slotKey}`}
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const isSelected = product.id === selectedId;
        const available =
          product.availabilityStatus !== "OUT_OF_STOCK" &&
          (product.stock ?? 0) > 0;

        const sellingPrice = getSellingPrice(product);
        const discountPercentage = getDiscountPercentage(product);

        const images =
          product.imageList?.length > 0
            ? product.imageList
            : parseImages(product.images);
        const primaryImage = images[0] || product.image || "/placeholder.png";
        const secondaryImage =
          images[1] && images[1] !== primaryImage ? images[1] : null;

        return (
          <article
            key={product.id}
            className={cn(
              "group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] duration-200",
              isSelected
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-primary/40 hover:shadow-sm"
            )}
          >
            <Link
              href={`/products/${product.slug}`}
              className="relative block aspect-square overflow-hidden bg-white"
              aria-label={`View ${product.name}`}
            >
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className={cn(
                  "object-contain p-4 transition-[transform,opacity] duration-300 group-hover:scale-[1.03]",
                  secondaryImage && "group-hover:opacity-0"
                )}
              />

              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="absolute inset-0 object-contain p-4 opacity-0 transition-[opacity,transform] duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
                />
              )}

              {discountPercentage > 0 && (
                <span className="absolute left-2.5 top-2.5 rounded bg-destructive px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {discountPercentage}% OFF
                </span>
              )}

              {isSelected && (
                <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  <CircleCheck className="h-3 w-3" />
                  In build
                </span>
              )}

              {!available && (
                <span
                  className={cn(
                    "absolute right-2.5 rounded bg-slate-900/85 px-1.5 py-0.5 text-[11px] font-medium text-white",
                    isSelected ? "top-10" : "top-2.5"
                  )}
                >
                  Out of stock
                </span>
              )}
            </Link>

            <div className="flex flex-1 flex-col p-3.5">
              {product.brand && (
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {product.brand}
                </p>
              )}

              <Link href={`/products/${product.slug}`} className="mt-1">
                <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                  {product.name}
                </h3>
              </Link>

              {product.chips?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {product.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-bold text-price">
                  ৳{sellingPrice.toLocaleString("en-US")}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-xs text-muted-foreground line-through">
                    ৳{product.price.toLocaleString("en-US")}
                  </span>
                )}
              </div>

              <p
                className={cn(
                  "mt-1 text-[11px]",
                  available ? "text-muted-foreground" : "text-destructive"
                )}
              >
                {available ? "In stock · EMI available" : "Currently unavailable"}
              </p>

              <div className="mt-auto pt-3">
                <Button
                  type="button"
                  size="sm"
                  variant={isSelected ? "secondary" : "default"}
                  className="h-9 w-full"
                  disabled={!available || isSelected}
                  onClick={() => handleSelect(product)}
                  aria-label={
                    isSelected
                      ? `${product.name} is already in your build`
                      : `Select ${product.name} for your build`
                  }
                >
                  {isSelected ? (
                    <>
                      <CircleCheck className="mr-1.5 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Select
                    </>
                  )}
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
