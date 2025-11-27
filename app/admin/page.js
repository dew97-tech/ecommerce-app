import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { CreditCard, DollarSign, Package, TrendingUp } from "lucide-react"

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

  const statCards = [
    {
      title: "Total Revenue",
      value: `৳${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Total earnings",
      trend: "+12.5%"
    },
    {
      title: "Orders",
      value: `${stats.orders}`,
      icon: CreditCard,
      description: "Total orders placed",
      trend: "+8.2%"
    },
    {
      title: "Products",
      value: `${stats.products}`,
      icon: Package,
      description: "Products in catalog",
      trend: "+3"
    },
  ]

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Overview of your store performance</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
