import { Sidebar } from '@/components/admin/sidebar'

export default function AdminLayout({ children }) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background border-r">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        {children}
      </main>
    </div>
  )
}
