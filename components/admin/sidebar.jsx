'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  },
  {
    label: 'Products',
    icon: Package,
    href: '/admin/products',
  },
  {
    label: 'Categories',
    icon: List,
    href: '/admin/categories',
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    href: '/admin/orders',
  },
  {
    label: 'Banners',
    icon: ImageIcon,
    href: '/admin/banners',
  },
  {
    label: 'Blogs',
    icon: FileText,
    href: '/admin/blogs',
  },
  {
    label: 'Comments',
    icon: MessageSquare,
    href: '/admin/comments',
  },
  {
    label: 'Reviews',
    icon: Star,
    href: '/admin/reviews',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="p-6">
        <Link href="/admin" className="flex items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </Link>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent',
                pathname === route.href
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>
      
      <Separator />
      
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
