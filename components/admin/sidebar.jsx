'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileText, Image as ImageIcon, LayoutDashboard, List, LogOut, MessageSquare, Package, ShoppingCart, Star } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    color: 'text-sky-500',
  },
  {
    label: 'Products',
    icon: Package,
    href: '/admin/products',
    color: 'text-violet-500',
  },
  {
    label: 'Categories',
    icon: List,
    href: '/admin/categories',
    color: 'text-emerald-500',
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    href: '/admin/orders',
    color: 'text-pink-700',
  },
  {
    label: 'Banners',
    icon: ImageIcon,
    href: '/admin/banners',
    color: 'text-orange-700',
  },
  {
    label: 'Blogs',
    icon: FileText,
    href: '/admin/blogs',
    color: 'text-yellow-500',
  },
  {
    label: 'Comments',
    icon: MessageSquare,
    href: '/admin/comments',
    color: 'text-blue-500',
  },
  {
    label: 'Reviews',
    icon: Star,
    href: '/admin/reviews',
    color: 'text-red-500',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/admin" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Button onClick={() => signOut()} variant="destructive" className="w-full justify-start">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
        </Button>
      </div>
    </div>
  )
}
