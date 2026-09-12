'use client'

import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { getDiscountPercentage, getSellingPrice } from "@/lib/price"
import { siteConfig } from "@/lib/site-config"
import { Facebook, Link as LinkIcon, MessageCircle, Package, ShieldCheck, Truck, Wallet } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const SPEC_CHIP_KEYS = [
  "Socket",
  "Type",
  "Memory Type",
  "Capacity",
  "Frequency",
  "Cores",
  "Threads",
  "Base Frequency",
  "Display Size",
  "Continuous Power",
  "Wattage",
]

const NOISE_FEATURES = new Set([
  "view more info",
  "view more",
  "view details",
  "read more",
  "learn more",
  "view full specification",
  "view full specifications",
])

function buildSpecChips(product) {
  const attributes = product?.attributes
  if (!attributes || typeof attributes !== "object") return []

  const chips = []
  for (const key of SPEC_CHIP_KEYS) {
    const value = attributes[key]
    if (value === undefined || value === null) continue
    const text = String(value).replace(/\s+/g, " ").trim()
    if (!text) continue
    chips.push(text)
    if (chips.length >= 4) break
  }
  return chips
}

export function ProductDetails({ product }) {
  const [selectedVariant] = useState(product.variants?.[0] || null)

  const variantAdjustment = selectedVariant?.price || 0
  const currentPrice = getSellingPrice(product) + variantAdjustment
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock
  const regularPrice = product.price + variantAdjustment
  const hasDiscount = getDiscountPercentage(product) > 0
  const specChips = buildSpecChips(product)

  const keyFeatures = product.shortDescription
    ? product.shortDescription
        .split(',')
        .map((feature) => feature.trim())
        .filter((feature) => {
          if (!feature) return false
          const normalized = feature.toLowerCase().replace(/[.:\s]+$/, '').trim()
          return !NOISE_FEATURES.has(normalized)
        })
    : []

  const shareUrl = () => (typeof window !== "undefined" ? window.location.href : "")

  const handleShare = (network) => {
    const url = encodeURIComponent(shareUrl())

    if (network === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer")
      return
    }

    if (network === "whatsapp") {
      window.open(`https://wa.me/?text=${url}`, "_blank", "noopener,noreferrer")
      return
    }

    navigator.clipboard
      ?.writeText(shareUrl())
      .then(() => toast.success("Product link copied"))
      .catch(() => toast.error("Could not copy the link"))
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
          {product.name}
        </h1>

        {specChips.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {specChips.map((chip) => (
              <span
                key={chip}
                title={chip}
                className="max-w-full break-words rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">Brand:</span>
          {product.brand ? (
            <Link
              href={`/products?brands=${encodeURIComponent(product.brand)}`}
              className="font-semibold text-primary hover:underline"
            >
              {product.brand}
            </Link>
          ) : (
            <span className="font-semibold text-foreground">Unknown</span>
          )}
          <span className="mx-1 h-4 w-px bg-border" />
          <span className="text-muted-foreground">Product code:</span>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
            {product.productCode || product.id.slice(-6)}
          </span>
        </div>

        <div className="mb-6 flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-price">
            ৳{currentPrice.toLocaleString("en-US")}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                ৳{regularPrice.toLocaleString("en-US")}
              </span>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                -{getDiscountPercentage(product)}%
              </span>
            </>
          )}
          <span
            className={
              currentStock > 0
                ? "ml-auto inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
                : "ml-auto inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive"
            }
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {currentStock > 0 ? "In stock" : "Out of stock"}
          </span>
        </div>

        {keyFeatures.length > 0 && (
          <div className="mb-6">
            <h3 className="relative mb-3 text-lg font-semibold text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-10 after:rounded-full after:bg-primary">
              Key Features
            </h3>
            <ul className="space-y-1.5">
              {keyFeatures.map((feature, index) => {
                const separatorIndex = feature.indexOf(":")
                const label =
                  separatorIndex > 0 ? feature.slice(0, separatorIndex + 1) : null
                const value =
                  separatorIndex > 0
                    ? feature.slice(separatorIndex + 1).trim()
                    : feature

                return (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {label ? (
                      <span>
                        <span className="font-medium text-foreground">
                          {label}
                        </span>{" "}
                        <span className="text-muted-foreground">{value}</span>
                      </span>
                    ) : (
                      <span className="font-medium text-foreground">
                        {feature}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
            <a
              href="#specifications"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              View full specifications
            </a>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" />
            Cash on delivery & online payment
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {siteConfig.emiNote}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" />
            {siteConfig.freeDeliveryNote}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4 text-primary" />
            Genuine product with official warranty
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <AddToCartButton product={{ ...product, selectedVariant }} />
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          <span>Share:</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            aria-label="Share on Facebook"
            onClick={() => handleShare("facebook")}
          >
            <Facebook className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            aria-label="Share on WhatsApp"
            onClick={() => handleShare("whatsapp")}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            aria-label="Copy product link"
            onClick={() => handleShare("copy")}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
