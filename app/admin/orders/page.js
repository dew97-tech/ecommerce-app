import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { CancellationInfo } from "@/components/admin/cancellation-info"
import { EmptyState } from "@/components/admin/empty-state"
import { OrderDetailsDialog } from "@/components/admin/order-details-dialog"
import { OrderStatusSelect } from "@/components/admin/order-status-select"
import { StatCard } from "@/components/admin/stat-card"
import { StatusBadge } from "@/components/admin/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/db"
import { formatAdminDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Banknote, CircleDashed, Clock, ShoppingBag, ShoppingCart } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'FAILED', label: 'Failed' },
]

function buildHref(status, searchParams) {
  const params = new URLSearchParams(searchParams)
  params.set('page', '1')

  if (status === 'all') {
    params.delete('status')
  } else {
    params.set('status', status)
  }

  return `/admin/orders?${params.toString()}`
}

export default async function OrdersPage(props) {
  const searchParams = await props.searchParams
  const statusFilter = STATUS_FILTERS.some((entry) => entry.key === searchParams?.status)
    ? searchParams.status
    : 'all'
  const currentPage = Math.max(1, Number(searchParams?.page) || 1)
  const itemsPerPage = 15
  const skip = (currentPage - 1) * itemsPerPage

  const searchTerm = (searchParams?.query ?? '').toString().trim().replace(/^#/, '')

  const searchWhere = searchTerm
    ? {
        OR: [
          { id: { contains: searchTerm } },
          { user: { name: { contains: searchTerm } } },
          { user: { email: { contains: searchTerm } } },
        ],
      }
    : {}
  const where = {
    ...(statusFilter === 'all' ? {} : { status: statusFilter }),
    ...searchWhere,
  }

  const [orders, totalCount, filteredStatusGroups, statusGroups, revenueAggregate] =
    await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          orderItems: {
            select: {
              id: true,
              quantity: true,
              priceAtPurchase: true,
              product: { select: { name: true, slug: true, images: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: itemsPerPage,
      }),
      db.order.count({ where }),
      db.order.groupBy({
        by: ['status'],
        where: searchWhere,
        _count: { _all: true },
      }),
      db.order.groupBy({ by: ['status'], _count: { _all: true } }),
      db.order.aggregate({
        where: { status: { notIn: ['CANCELLED', 'FAILED'] } },
        _sum: { totalAmount: true },
      }),
    ])

  const filteredCounts = Object.fromEntries(
    filteredStatusGroups.map((entry) => [entry.status, entry._count._all])
  )
  const globalCounts = Object.fromEntries(
    statusGroups.map((entry) => [entry.status, entry._count._all])
  )
  const totalOrders = statusGroups.reduce(
    (sum, entry) => sum + entry._count._all,
    0
  )
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const stats = [
    {
      label: 'Total orders',
      value: totalOrders.toLocaleString('en-US'),
      icon: ShoppingBag,
      tone: 'default',
      href: '/admin/orders',
    },
    {
      label: 'Pending',
      value: (globalCounts.PENDING ?? 0).toLocaleString('en-US'),
      icon: Clock,
      tone: 'warning',
      href: '/admin/orders?status=PENDING',
    },
    {
      label: 'Processing',
      value: (globalCounts.PROCESSING ?? 0).toLocaleString('en-US'),
      icon: CircleDashed,
      tone: 'default',
      href: '/admin/orders?status=PROCESSING',
    },
    {
      label: 'Revenue',
      value: `৳${(revenueAggregate._sum.totalAmount ?? 0).toLocaleString('en-US')}`,
      icon: Banknote,
      tone: 'success',
      hint: 'Excludes cancelled and failed orders',
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Orders"
        description="Track payments, fulfilment and customer deliveries."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {STATUS_FILTERS.map((entry) => {
              const count =
                entry.key === 'all' ? undefined : filteredCounts[entry.key] ?? 0

              return (
                <Link
                  key={entry.key}
                  href={buildHref(entry.key, searchParams)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    statusFilter === entry.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {entry.label}
                  {count !== undefined && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          <AdminSearch placeholder="Search orders..." />
        </div>

        {orders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description="Try a different status filter or search term."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </TableCell>

                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {order.user?.name || 'Guest'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {order.user?.email}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {order.orderItems.length} items
                  </TableCell>

                  <TableCell className="font-semibold text-price">
                    ৳{order.totalAmount.toLocaleString("en-US")}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={order.paymentStatus} kind="payment" />
                  </TableCell>

                  <TableCell>
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
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatAdminDate(order.createdAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <OrderDetailsDialog order={order} />
                      <OrderStatusSelect
                        orderId={order.id}
                        status={order.status}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="border-t border-border p-4">
          <AdminPagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}
