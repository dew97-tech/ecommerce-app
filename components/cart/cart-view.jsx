'use client'

import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getCartItemDetails, validateCartLine } from "@/lib/actions/cart"
import { useIsMounted } from "@/lib/use-is-mounted"
import { useCartStore } from "@/store/useCartStore"
import { ArrowRight, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

function getVariantLabel(variant) {
  if (!variant) return ""
  return [variant.color, variant.size, variant.capacity].filter(Boolean).join(" · ")
}

export function CartView() {
  const isMounted = useIsMounted()
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const total = useCartStore((state) => state.total)
  const clearCart = useCartStore((state) => state.clearCart)
  const syncItems = useCartStore((state) => state.syncItems)
  const [clearOpen, setClearOpen] = useState(false)
  const [pendingQuantityId, setPendingQuantityId] = useState(null)

  useEffect(() => {
    if (!isMounted) return

    const ids = useCartStore.getState().items.map((item) => item.id)
    if (ids.length === 0) return

    let cancelled = false

    getCartItemDetails(ids)
      .then((details) => {
        if (cancelled) return

        const { removed } = syncItems(details)

        if (removed.length > 0) {
          toast.info(
            removed.length === 1
              ? "An unavailable item was removed from your cart"
              : `${removed.length} unavailable items were removed from your cart`
          )
        }
      })
      .catch((error) => {
        console.error("Failed to refresh cart items:", error)
      })

    return () => {
      cancelled = true
    }
  }, [isMounted, syncItems])

  if (!isMounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="h-16 animate-pulse rounded-xl border border-border bg-muted/30" />
          <div className="h-28 animate-pulse rounded-xl border border-border bg-muted/30" />
          <div className="h-28 animate-pulse rounded-xl border border-border bg-muted/30" />
        </div>
        <div className="h-72 animate-pulse rounded-xl border border-border bg-muted/30 lg:col-span-1" />
      </div>
    )
  }

  const handleRemove = (id) => {
    removeItem(id)
    toast.success("Item removed from cart")
  }

  const handleClear = () => {
    clearCart()
    setClearOpen(false)
    toast.success("Cart cleared")
  }

  const handleQuantityChange = async (item, next) => {
    if (pendingQuantityId) return

    setPendingQuantityId(item.id)

    try {
      const fresh = await validateCartLine(item.id, next)

      if (!fresh || !fresh.available) {
        removeItem(item.id)
        toast.error("This product is out of stock and was removed from your cart")
        return
      }

      syncItems([fresh], { removeMissing: false })

      if (next > fresh.stock) {
        updateQuantity(item.id, fresh.stock)
        toast.error(`Only ${fresh.stock} left in stock`)
      } else {
        updateQuantity(item.id, next)
      }
    } catch (error) {
      console.error("Quantity update error:", error)
      toast.error("Could not update quantity. Please try again.")
    } finally {
      setPendingQuantityId(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Start adding some products to your cart and they will show up here.
        </p>
        <Button asChild className="mt-6 gap-1.5">
          <Link href="/products">
            Browse products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  const itemCount = items.length

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold">
                Cart items
                <span className="ml-1.5 font-normal text-muted-foreground">
                  ({itemCount})
                </span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setClearOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Clear cart
              </Button>
            </div>

            <ul className="divide-y divide-border">
              {items.map((item) => {
                const variantLabel = getVariantLabel(item.variant)
                const stockLimit = item.stock ?? Infinity

                return (
                  <li key={item.id} className="flex gap-4 p-4 sm:p-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40 sm:h-24 sm:w-24">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {item.slug ? (
                            <Link
                              href={`/products/${item.slug}`}
                              className="line-clamp-2 text-sm font-medium transition-colors hover:text-primary"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <p className="line-clamp-2 text-sm font-medium">
                              {item.name}
                            </p>
                          )}
                          {variantLabel && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {variantLabel}
                            </p>
                          )}
                          <p className="mt-1 text-sm font-semibold text-price">
                            ৳{item.price.toLocaleString('en-US')}
                          </p>
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemove(item.id)}
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove item</TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-lg border border-border">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-r-none"
                            onClick={() =>
                              handleQuantityChange(item, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 ||
                              pendingQuantityId === item.id
                            }
                            aria-label="Decrease quantity"
                            title="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="flex w-10 items-center justify-center text-sm font-medium">
                            {pendingQuantityId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          {item.quantity >= stockLimit ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} className="inline-flex">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-l-none"
                                    disabled
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Only {item.stock} available
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-l-none"
                              onClick={() =>
                                handleQuantityChange(item, item.quantity + 1)
                              }
                              disabled={pendingQuantityId === item.id}
                              aria-label="Increase quantity"
                              title="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <p className="text-sm font-semibold">
                          ৳
                          {(item.price * item.quantity).toLocaleString('en-US')}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <aside className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ৳{total().toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-success">Free</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-lg font-bold text-price">
                    ৳{total().toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <DeleteConfirmationDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        onConfirm={handleClear}
        title="Clear cart?"
        description={`Remove all ${itemCount} ${
          itemCount === 1 ? "item" : "items"
        } from your cart? This cannot be undone.`}
        confirmLabel="Clear cart"
      />
    </>
  )
}
