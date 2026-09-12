import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { EmptyState } from "@/components/admin/empty-state"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { updateOrderStatus } from "@/lib/actions/admin-orders"
import { db } from "@/lib/db"
import { cn } from "@/lib/utils"
import { Calendar, CreditCard, Eye, MapPin, Package, ShoppingCart, User } from "lucide-react"
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

  const where = statusFilter === 'all' ? {} : { status: statusFilter }

  const [orders, totalCount, statusCounts] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            priceAtPurchase: true,
            product: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: itemsPerPage,
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const countsByStatus = Object.fromEntries(
    statusCounts.map((entry) => [entry.status, entry._count._all])
  )
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Orders"
        description="Track payments, fulfilment and customer deliveries."
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((entry) => {
          const count = entry.key === 'all' ? undefined : countsByStatus[entry.key] ?? 0

          return (
            <Link
              key={entry.key}
              href={buildHref(entry.key, searchParams)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                statusFilter === entry.key
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {entry.label}
              {count !== undefined && (
                <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-card">
        {orders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description="Orders will appear here as customers check out."
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
                    <StatusBadge status={order.status} />
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US")}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-3xl">
                          <div className="border-b border-border px-6 py-4">
                            <DialogHeader>
                              <DialogTitle>
                                Order #{order.id.slice(0, 8).toUpperCase()}
                              </DialogTitle>
                              <DialogDescription>
                                Placed{" "}
                                {new Date(order.createdAt).toLocaleString("en-US")}
                              </DialogDescription>
                            </DialogHeader>
                          </div>

                          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="rounded-lg border border-border p-3">
                                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  <User className="h-3.5 w-3.5" />
                                  Customer
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                  {order.user?.name || 'Guest'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {order.user?.email}
                                </p>
                              </div>

                              <div className="rounded-lg border border-border p-3">
                                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  <CreditCard className="h-3.5 w-3.5" />
                                  Payment
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <StatusBadge status={order.paymentStatus} kind="payment" />
                                  <span className="text-xs text-muted-foreground">
                                    {order.paymentMethod}
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-lg border border-border p-3 sm:col-span-2">
                                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" />
                                  Shipping address
                                </p>
                                <p className="mt-1 text-sm">
                                  {order.shippingAddress}
                                </p>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                <Package className="h-4 w-4" />
                                Items
                              </h4>
                              <div className="space-y-2">
                                {order.orderItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium">
                                        {item.product.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {item.quantity} × ৳
                                        {item.priceAtPurchase.toLocaleString("en-US")}
                                      </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-price">
                                      ৳
                                      {(
                                        item.quantity * item.priceAtPurchase
                                      ).toLocaleString("en-US")}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Total</span>
                              <span className="text-xl font-bold text-price">
                                ৳{order.totalAmount.toLocaleString("en-US")}
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <form
                        action={updateOrderStatus.bind(null, order.id)}
                        className="flex items-center gap-2"
                      >
                        <Select name="status" defaultValue={order.status}>
                          <SelectTrigger className="h-9 w-[130px]" aria-label="Order status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" type="submit">
                          Update
                        </Button>
                      </form>
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
