import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { updateOrderStatus } from "@/lib/admin-order-actions"
import { db } from "@/lib/db"
import { Calendar, Eye, MapPin, Package, User } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    include: { 
      user: true, 
      orderItems: { 
        include: { product: true } 
      } 
    },
    orderBy: { createdAt: 'desc' },
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'secondary'
      case 'PROCESSING': return 'default'
      case 'SHIPPED': return 'default'
      case 'DELIVERED': return 'default'
      case 'CANCELLED': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="p-8 pt-6 space-y-6">
      <div>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Orders Management</h2>
        <p className="text-muted-foreground mt-1">View and manage customer orders</p>
      </div>
      
      <Card className="border-0 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Order ID</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Items</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No orders found.</p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">{order.user.name}</span>
                        <span className="text-xs text-muted-foreground">{order.user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.orderItems.length} items</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">৳{order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-3 w-3" /> View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">Order #{order.id.slice(0, 8).toUpperCase()}</DialogTitle>
                            <DialogDescription>Complete order details and product information</DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <User className="h-4 w-4" /> Customer
                                </p>
                                <p className="font-medium">{order.user.name}</p>
                                <p className="text-sm text-muted-foreground">{order.user.email}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Calendar className="h-4 w-4" /> Order Date
                                </p>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Shipping Address
                              </p>
                              <p className="font-medium">{order.shippingAddress}</p>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5" /> Order Items
                              </h4>
                              <div className="space-y-3">
                                {order.orderItems.map((item) => (
                                  <Card key={item.id} className="border-0 bg-accent/30">
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                          <p className="font-semibold">{item.product.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            SKU: {item.product.slug}
                                          </p>
                                          <div className="flex gap-4 text-sm">
                                            <span>Quantity: <strong>{item.quantity}</strong></span>
                                            <span>Price: <strong>৳{item.priceAtPurchase.toLocaleString()}</strong></span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-muted-foreground">Subtotal</p>
                                          <p className="text-lg font-bold text-primary">
                                            ৳{(item.quantity * item.priceAtPurchase).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold">Total Amount</span>
                              <span className="text-2xl font-bold text-primary">৳{order.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <form action={updateOrderStatus.bind(null, order.id)} className="flex items-center gap-2">
                        <Select name="status" defaultValue={order.status}>
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" type="submit">Update</Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
