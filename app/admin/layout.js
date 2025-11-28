import { AdminLayoutClient } from '@/components/admin/admin-layout-client'

export default function AdminLayout({ children }) {
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  )
}
