import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { CreditCard, DollarSign, Package } from "lucide-react"

export const dynamic = 'force-dynamic'

async function getStats() {
  const totalRevenue = await db.order.aggregate({
    where: { status: { not: 'CANCELLED' } },
    _sum: { totalAmount: true },
  })
  
  const totalOrders = await db.order.count()
  const totalProducts = await db.product.count()
  
  return {
    revenue: totalRevenue._sum.totalAmount || 0,
    orders: totalOrders,
    products: totalProducts
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳ {stats.revenue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
