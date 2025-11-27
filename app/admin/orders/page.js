import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { updateOrderStatus } from "@/lib/admin-order-actions"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    include: { user: true, orderItems: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8 pt-6 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{order.user.name}</span>
                    <span className="text-xs text-muted-foreground">{order.user.email}</span>
                  </div>
                </TableCell>
                <TableCell>৳ {order.totalAmount}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <form action={updateOrderStatus.bind(null, order.id)} className="flex items-center gap-2">
                    <select name="status" defaultValue={order.status} className="border rounded p-1 text-sm bg-background">
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <Button size="sm" type="submit">Update</Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
