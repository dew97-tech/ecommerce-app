import { StatusBadge } from "@/components/admin/status-badge"
import { OrderStatusSteps } from "@/components/orders/order-status-steps"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatAdminDateTime, formatCancelledBy, formatPaymentMethod } from "@/lib/format"
import { getFirstImage } from "@/lib/images"
import { CreditCard, Eye, MapPin, MessageSquareWarning, Package, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function OrderDetailsDialog({ order }) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const itemCount = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          aria-label={`View order #${shortId}`}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-3xl">
        <div className="flex max-h-[90vh] min-h-0 flex-col">
          <div className="border-b border-border px-6 py-4">
            <DialogHeader className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>Order #{shortId}</DialogTitle>
                <StatusBadge status={order.paymentStatus} kind="payment" />
                <StatusBadge status={order.status} />
              </div>
              <DialogDescription>
                Placed {formatAdminDateTime(order.createdAt)} · {itemCount}{" "}
                {itemCount === 1 ? "item" : "items"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid gap-6 px-6 py-5 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="min-w-0 space-y-5">
                <OrderStatusSteps
                  status={order.status}
                  cancellationReason={order.cancellationReason}
                  cancellationNote={order.cancellationNote}
                />

                <section className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Items
                  </h4>
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {order.orderItems.map((item) => {
                      const image = getFirstImage(item.product.images, null)

                      return (
                        <li key={item.id} className="flex items-center gap-3 p-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                            {image ? (
                              <Image
                                src={image}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <Package className="absolute inset-0 m-auto h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                            >
                              {item.product.name}
                            </Link>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.quantity} × ৳
                              {item.priceAtPurchase.toLocaleString("en-US")}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold text-price">
                            ৳
                            {(item.quantity * item.priceAtPurchase).toLocaleString(
                              "en-US"
                            )}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              </div>

              <aside className="min-w-0">
                <div className="divide-y divide-border rounded-lg border border-border bg-muted/30">
                  <section className="p-4">
                    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      Customer
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-foreground">
                      {order.user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.user?.email || "No email on file"}
                    </p>
                  </section>

                  <section className="p-4">
                    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5" />
                      Payment
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-foreground">
                      {formatPaymentMethod(order.paymentMethod)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.transactionId
                        ? `Txn ${order.transactionId}`
                        : "No transaction ID"}
                    </p>
                  </section>

                  <section className="p-4">
                    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      Shipping address
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                      {order.shippingAddress}
                    </p>
                  </section>

                  {order.status === "CANCELLED" && (
                    <section className="p-4">
                      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <MessageSquareWarning className="h-3.5 w-3.5" />
                        Cancellation
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-foreground">
                        {formatCancelledBy(order.cancelledBy)}
                      </p>
                      {order.cancellationReason && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {order.cancellationReason}
                        </p>
                      )}
                      {order.cancellationNote && (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {order.cancellationNote}
                        </p>
                      )}
                      {order.cancelledAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatAdminDateTime(order.cancelledAt)}
                        </p>
                      )}
                    </section>
                  )}
                </div>
              </aside>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-4 sm:justify-start">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-price">
                ৳{order.totalAmount.toLocaleString("en-US")}
              </span>
            </div>
            <DialogClose asChild>
              <Button variant="outline" className="sm:w-auto">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
