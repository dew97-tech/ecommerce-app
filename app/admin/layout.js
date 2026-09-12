import { auth } from '@/auth'
import { AdminLayoutClient } from '@/components/admin/admin-layout-client'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const [pendingOrders, lowStock] = await Promise.all([
    db.order.count({ where: { status: 'PENDING' } }),
    db.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
  ])

  return (
    <AdminLayoutClient counts={{ pendingOrders, lowStock }}>
      {children}
    </AdminLayoutClient>
  )
}
