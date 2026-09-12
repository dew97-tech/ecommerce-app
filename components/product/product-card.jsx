'use client'

import { Button } from "@/components/ui/button"
import { parseImages } from "@/lib/images"
import { getDiscountPercentage, getSellingPrice } from "@/lib/price"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/useCartStore"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

export function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem)

  const sellingPrice = getSellingPrice(product)
  const discountPercentage = getDiscountPercentage(product)

  const images = parseImages(product.images)
  const primaryImage = images[0] || "/placeholder.png"
  const secondaryImage = images[1] && images[1] !== primaryImage ? images[1] : null

  const isAvailable =
    product.availabilityStatus !== "OUT_OF_STOCK" && (product.stock ?? 0) > 0
  const label = product.brand || product.category?.name || ""

  const handleAddToCart = () => {
    if (!isAvailable) return

    addItem({
      id: product.id,
      name: product.name,
      price: sellingPrice,
      image: primaryImage,
      quantity: 1,
      stock: product.stock,
    })

    toast.success("Added to cart")
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-sm">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-white"
        aria-label={product.name}
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="absolute inset-0 object-contain p-4 opacity-0 transition-[opacity,transform] duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        )}

        {(discountPercentage > 0 || product.isTrending) && (
          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
            {discountPercentage > 0 && (
              <span className="rounded bg-destructive px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {discountPercentage}% OFF
              </span>
            )}
            {product.isTrending && (
              <span className="rounded bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                Trending
              </span>
            )}
          </div>
        )}

        {!isAvailable && (
          <span className="absolute right-2.5 top-2.5 rounded bg-slate-900/85 px-1.5 py-0.5 text-[11px] font-medium text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        {label && (
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        )}

        <Link href={`/products/${product.slug}`} className="mt-1 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

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
            isAvailable ? "text-muted-foreground" : "text-destructive"
          )}
        >
          {isAvailable ? "In stock · EMI available" : "Currently unavailable"}
        </p>

        <Button
          type="button"
          size="sm"
          variant={isAvailable ? "default" : "secondary"}
          className="mt-3 h-9 w-full"
          disabled={!isAvailable}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="mr-1.5 h-4 w-4" />
          {isAvailable ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </article>
  )
}
