import { auth } from "@/auth"
import { StatusBadge } from "@/components/admin/status-badge"
import { OrderStatusSteps } from "@/components/orders/order-status-steps"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { getFirstImage } from "@/lib/images"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { DeleteOrderButton } from "./delete-order-button"
import { PayNowButton } from "./pay-now-button"

export const metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
}

const PAGE_SIZE = 10
const ACTIVE_STATUSES = ["PENDING", "PROCESSING", "SHIPPED"]

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "FAILED", label: "Failed" },
]

const PAYMENT_METHOD_LABELS = {
  COD: "Cash on Delivery",
  SSLCOMMERZ: "Card / Online Payment",
}

function buildHref(status, page = 1) {
  const params = new URLSearchParams()
  if (status && status !== "all") params.set("status", status)
  if (page > 1) params.set("page", String(page))

  const query = params.toString()
  return query ? `/orders?${query}` : "/orders"
}

export default async function OrdersPage({ searchParams }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userId = session.user.id
  const resolvedSearchParams = await searchParams
  const statusFilter = STATUS_FILTERS.some(
    (filter) => filter.key === resolvedSearchParams?.status
  )
    ? resolvedSearchParams.status
    : "all"
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page) || 1)

  const where = {
    userId,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  }

  const [orders, filteredCount, statusGroups, spendAggregate] =
    await Promise.all([
      db.order.findMany({
        where,
        select: {
          id: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          transactionId: true,
          shippingAddress: true,
          createdAt: true,
          orderItems: {
            select: {
              id: true,
              quantity: true,
              priceAtPurchase: true,
              product: { select: { name: true, slug: true, images: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      db.order.count({ where }),
      db.order.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
      }),
      db.order.aggregate({
        where: { userId, status: { notIn: ["CANCELLED", "FAILED"] } },
        _sum: { totalAmount: true },
      }),
    ])

  const statusCounts = Object.fromEntries(
    statusGroups.map((group) => [group.status, group._count._all])
  )
  const totalOrders = statusGroups.reduce(
    (sum, group) => sum + group._count._all,
    0
  )
  const activeCount = ACTIVE_STATUSES.reduce(
    (sum, status) => sum + (statusCounts[status] ?? 0),
    0
  )
  const deliveredCount = statusCounts.DELIVERED ?? 0
  const totalSpent = spendAggregate._sum.totalAmount ?? 0
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE))
  const activeFilter = STATUS_FILTERS.find(
    (filter) => filter.key === statusFilter
  )

  const stats = [
    {
      label: "Total orders",
      value: totalOrders.toLocaleString("en-US"),
      icon: ShoppingBag,
    },
    {
      label: "Active",
      value: activeCount.toLocaleString("en-US"),
      icon: Truck,
    },
    {
      label: "Delivered",
      value: deliveredCount.toLocaleString("en-US"),
      icon: CheckCircle2,
    },
    {
      label: "Total spent",
      value: `৳${totalSpent.toLocaleString("en-US")}`,
      icon: CreditCard,
    },
  ]

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage your orders
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/products">
            Continue shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {totalOrders === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            When you place an order it will appear here with live status,
            payment info and delivery details.
          </p>
          <Button asChild className="mt-6 gap-1.5">
            <Link href="/products">
              Browse products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="truncate text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
              const count =
                filter.key === "all"
                  ? totalOrders
                  : statusCounts[filter.key] ?? 0
              const isActive = statusFilter === filter.key

              return (
                <Link
                  key={filter.key}
                  href={buildHref(filter.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {filter.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </Link>
              )
            })}
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
              <Package className="h-10 w-10 text-muted-foreground/50" />
              <h2 className="mt-3 text-base font-semibold">
                No {activeFilter?.label.toLowerCase()} orders
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different status filter.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-5">
                <Link href="/orders">Clear filter</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const canPay =
                  (order.status === "PENDING" || order.status === "FAILED") &&
                  order.paymentStatus !== "PAID" &&
                  order.paymentMethod === "SSLCOMMERZ"
                const canDelete =
                  order.status === "PENDING" ||
                  order.status === "FAILED" ||
                  order.status === "CANCELLED"
                const itemCount = order.orderItems.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <StatusBadge status={order.status} />
                        <StatusBadge
                          status={order.paymentStatus}
                          kind="payment"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                        <span className="ml-auto text-muted-foreground sm:ml-0">
                          Total{" "}
                          <span className="text-base font-bold text-primary">
                            ৳{order.totalAmount.toLocaleString("en-US")}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5 px-4 py-5 sm:px-5">
                      <OrderStatusSteps status={order.status} />

                      <ul className="divide-y divide-border">
                        {order.orderItems.map((item) => {
                          const image = getFirstImage(
                            item.product.images,
                            null
                          )

                          return (
                            <li
                              key={item.id}
                              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                            >
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
                                {image ? (
                                  <Image
                                    src={image}
                                    alt={item.product.name}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/products/${item.product.slug}`}
                                  className="line-clamp-2 text-sm font-medium transition-colors hover:text-primary"
                                >
                                  {item.product.name}
                                </Link>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {item.quantity} × ৳
                                  {item.priceAtPurchase.toLocaleString("en-US")}
                                </p>
                              </div>

                              <p className="shrink-0 text-sm font-semibold">
                                ৳
                                {(
                                  item.quantity * item.priceAtPurchase
                                ).toLocaleString("en-US")}
                              </p>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    <div className="grid gap-4 border-t border-border bg-muted/20 px-4 py-4 text-sm sm:grid-cols-2 sm:px-5">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-medium">Delivery address</p>
                          <p className="mt-0.5 leading-relaxed text-muted-foreground">
                            {order.shippingAddress}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-medium">Payment</p>
                          <p className="mt-0.5 text-muted-foreground">
                            {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                              order.paymentMethod}
                            {order.transactionId
                              ? ` · ${order.transactionId}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {(canPay || canDelete) && (
                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3 sm:px-5">
                        {canPay && (
                          <PayNowButton
                            orderId={order.id}
                            amount={order.totalAmount}
                          />
                        )}
                        {canDelete && <DeleteOrderButton orderId={order.id} />}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} · {filteredCount}{" "}
                {filteredCount === 1 ? "order" : "orders"}
              </p>
              <div className="flex gap-2">
                <Button
                  asChild={currentPage > 1}
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                >
                  {currentPage > 1 ? (
                    <Link href={buildHref(statusFilter, currentPage - 1)}>
                      Previous
                    </Link>
                  ) : (
                    "Previous"
                  )}
                </Button>
                <Button
                  asChild={currentPage < totalPages}
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                >
                  {currentPage < totalPages ? (
                    <Link href={buildHref(statusFilter, currentPage + 1)}>
                      Next
                    </Link>
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
