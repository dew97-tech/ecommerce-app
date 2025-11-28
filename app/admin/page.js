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
  
  // Active users (users who placed an order in the last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const activeUsersCount = await db.user.count({
    where: {
      orders: {
        some: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }
    }
  })

  // Revenue Chart Data (Last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const ordersLast7Days = await db.order.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo
      },
      status: { not: 'CANCELLED' }
    },
    select: {
      createdAt: true,
      totalAmount: true
    }
  })

  const chartData = Array(7).fill(0).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateString = date.toISOString().split('T')[0]
    
    const dayTotal = ordersLast7Days
      .filter(order => order.createdAt.toISOString().split('T')[0] === dateString)
      .reduce((sum, order) => sum + order.totalAmount, 0)
      
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayTotal
    }
  })

  // Recent Sales
  const recentSales = await db.order.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  return {
    revenue: totalRevenue._sum.totalAmount || 0,
    orders: totalOrders,
    products: totalProducts,
    activeUsers: activeUsersCount,
    chartData,
    recentSales
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const maxVal = Math.max(...stats.chartData.map(d => d.amount), 100) // Avoid divide by zero

  const statCards = [
    {
      title: "Total Revenue",
      value: `৳${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Total earnings",
      trend: "+12.5%", // You'd calculate this by comparing with previous period
      color: "text-green-500"
    },
    {
      title: "Orders",
      value: `${stats.orders}`,
      icon: CreditCard,
      description: "Total orders placed",
      trend: "+8.2%",
      color: "text-blue-500"
    },
    {
      title: "Products",
      value: `${stats.products}`,
      icon: Package,
      description: "Products in catalog",
      trend: "+3",
      color: "text-orange-500"
    },
    {
      title: "Active Users",
      value: `${stats.activeUsers}`,
      icon: TrendingUp,
      description: "Placed order in last 30 days",
      trend: "+15%",
      color: "text-purple-500"
    }
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
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">{stat.trend}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[200px] w-full flex items-end justify-between gap-2 px-4">
                {stats.chartData.map((data, i) => (
                  <div key={i} className="w-full bg-primary/10 hover:bg-primary/20 transition-colors rounded-t-md relative group" style={{ height: `${(data.amount / maxVal) * 100}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      ৳{data.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 mt-2 text-xs text-muted-foreground">
                {stats.chartData.map((data, i) => (
                  <span key={i}>{data.date}</span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <p className="text-sm text-muted-foreground">
                You made {stats.recentSales.length} sales recently.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {stats.recentSales.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent sales found.</p>
                ) : (
                    stats.recentSales.map((order) => (
                    <div key={order.id} className="flex items-center">
                        <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{order.user.name || 'Guest'}</p>
                        <p className="text-sm text-muted-foreground">
                            {order.user.email}
                        </p>
                        </div>
                        <div className="ml-auto font-medium">+৳{order.totalAmount.toLocaleString()}</div>
                    </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
