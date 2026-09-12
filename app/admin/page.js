import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { CancellationInfo } from "@/components/admin/cancellation-info"
import { EmptyState } from "@/components/admin/empty-state"
import { StatCard } from "@/components/admin/stat-card"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { parseImages } from "@/lib/images"
import {
  AlertTriangle,
  Archive,
  Clock,
  FolderTree,
  Image as ImageIcon,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const dynamic = 'force-dynamic'

function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

async function getDashboardData() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(now.getDate() - 60)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)

  const [
    revenue30,
    revenuePrev30,
    orders30,
    ordersPrev30,
    activeProducts,
    totalProducts,
    activeUsers,
    pendingOrders,
    lowStockCount,
    archivedCount,
    ordersLast7Days,
    recentOrders,
    lowStockProducts,
    topCategories,
  ] = await Promise.all([
    db.order.aggregate({
      where: {
        status: { not: "CANCELLED" },
        paymentStatus: { not: "FAILED" },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { totalAmount: true },
    }),
    db.order.aggregate({
      where: {
        status: { not: "CANCELLED" },
        paymentStatus: { not: "FAILED" },
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
      _sum: { totalAmount: true },
    }),
    db.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.order.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    db.product.count({ where: { isActive: true } }),
    db.product.count(),
    db.user.count({
      where: { orders: { some: { createdAt: { gte: thirtyDaysAgo } } } },
    }),
    db.order.count({ where: { status: "PENDING" } }),
    db.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
    db.product.count({ where: { isActive: false } }),
    db.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { not: "CANCELLED" },
      },
      select: { createdAt: true, totalAmount: true },
    }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { select: { id: true } },
      },
    }),
    db.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, slug: true, stock: true, images: true },
    }),
    db.category.findMany({
      orderBy: { products: { _count: "desc" } },
      take: 6,
      select: {
        id: true,
        name: true,
        _count: { select: { products: true } },
      },
    }),
  ])

  const chartData = Array(7)
    .fill(0)
    .map((_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      const dateString = date.toISOString().split("T")[0]

      const amount = ordersLast7Days
        .filter(
          (order) => order.createdAt.toISOString().split("T")[0] === dateString
        )
        .reduce((sum, order) => sum + order.totalAmount, 0)

      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        amount,
      }
    })

  return {
    revenue30: revenue30._sum.totalAmount || 0,
    revenuePrev30: revenuePrev30._sum.totalAmount || 0,
    orders30,
    ordersPrev30,
    activeProducts,
    totalProducts,
    activeUsers,
    pendingOrders,
    lowStockCount,
    archivedCount,
    chartData,
    recentOrders,
    lowStockProducts,
    topCategories,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardData()
  const maxChartValue = Math.max(...stats.chartData.map((day) => day.amount), 1)
  const hasChartData = stats.chartData.some((day) => day.amount > 0)

  const kpis = [
    {
      label: "Revenue (30d)",
      value: `৳${stats.revenue30.toLocaleString("en-US")}`,
      icon: TrendingUp,
      tone: "success",
      trend: percentChange(stats.revenue30, stats.revenuePrev30),
    },
    {
      label: "Orders (30d)",
      value: stats.orders30.toLocaleString("en-US"),
      icon: ShoppingCart,
      tone: "default",
      trend: percentChange(stats.orders30, stats.ordersPrev30),
    },
    {
      label: "Active products",
      value: stats.activeProducts.toLocaleString("en-US"),
      icon: Package,
      tone: "default",
      hint: `${stats.totalProducts.toLocaleString("en-US")} total in catalog`,
    },
    {
      label: "Active buyers (30d)",
      value: stats.activeUsers.toLocaleString("en-US"),
      icon: Users,
      tone: "default",
      hint: "Customers who placed an order",
    },
  ]

  const alerts = [
    {
      label: "Pending orders",
      value: stats.pendingOrders.toLocaleString("en-US"),
      icon: Clock,
      tone: stats.pendingOrders > 0 ? "warning" : "default",
      href: "/admin/orders?status=PENDING",
      hint: "Waiting for confirmation",
    },
    {
      label: "Low stock (≤ 5)",
      value: stats.lowStockCount.toLocaleString("en-US"),
      icon: AlertTriangle,
      tone: stats.lowStockCount > 0 ? "danger" : "success",
      href: "/admin/products?filter=low-stock",
      hint: "Active products to restock",
    },
    {
      label: "Archived products",
      value: stats.archivedCount.toLocaleString("en-US"),
      icon: Archive,
      tone: "default",
      href: "/admin/products?filter=archived",
      hint: "Hidden from the storefront",
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Dashboard"
        description="Track sales, stock health and catalog activity."
        actions={
          <>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4" />
                Add product
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href="/admin/categories/new">
                <FolderTree className="h-4 w-4" />
                Add category
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href="/admin/banners">
                <ImageIcon className="h-4 w-4" />
                Add banner
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {alerts.map((alert) => (
          <StatCard key={alert.label} {...alert} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">

        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Revenue — last 7 days</h2>
              <p className="text-xs text-muted-foreground">
                Orders excluding cancelled and failed payments
              </p>
            </div>
          </div>

          {hasChartData ? (
            <>
              <div className="flex h-[200px] items-end justify-between gap-3">
                {stats.chartData.map((day, index) => (
                  <div
                    key={index}
                    className="group relative flex h-full w-full items-end"
                  >
                    <div
                      className="w-full rounded-t-md bg-primary/25 transition-colors group-hover:bg-primary/50"
                      style={{
                        height: `${Math.max(
                          (day.amount / maxChartValue) * 100,
                          day.amount > 0 ? 4 : 1
                        )}%`,
                      }}
                    />
                    <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      ৳{day.amount.toLocaleString("en-US")}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
                {stats.chartData.map((day, index) => (
                  <span key={index} className="flex-1 text-center">
                    {day.date}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No sales in the last 7 days.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="New orders will appear here."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {order.user?.name || "Guest"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      #{order.id.slice(-6).toUpperCase()} ·{" "}
                      {order.orderItems.length} item
                      {order.orderItems.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-price">
                      ৳{order.totalAmount.toLocaleString("en-US")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={order.status} />
                      {order.status === "CANCELLED" && (
                        <CancellationInfo
                          reason={order.cancellationReason}
                          note={order.cancellationNote}
                          cancelledBy={order.cancelledBy}
                          cancelledAt={order.cancelledAt}
                        />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">

        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Low stock</h2>
            <Link
              href="/admin/products?filter=low-stock"
              className="text-xs font-medium text-primary hover:underline"
            >
              Manage
            </Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Every active product has healthy stock.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-white">
                    <Image
                      src={
                        parseImages(product.images)[0] || "/placeholder.png"
                      }
                      alt=""
                      fill
                      sizes="40px"
                      className="object-contain p-1"
                    />
                  </div>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="min-w-0 flex-1 truncate text-sm font-medium text-foreground hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                    {product.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Top categories</h2>
            <Link
              href="/admin/categories"
              className="text-xs font-medium text-primary hover:underline"
            >
              Manage
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {stats.topCategories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <Link
                  href={`/admin/categories/${category.id}`}
                  className="min-w-0 truncate text-sm font-medium text-foreground hover:text-primary"
                >
                  {category.name}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {category._count.products.toLocaleString("en-US")} products
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
