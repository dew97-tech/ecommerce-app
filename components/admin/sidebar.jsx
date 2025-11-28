'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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

export function Sidebar({ collapsed = false }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-full flex-col bg-card">
      <div className={cn("flex items-center h-16 px-4 border-b", collapsed ? "justify-center" : "justify-start")}>
        <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
          <div className="bg-primary/10 p-1.5 rounded-md shrink-0">
             <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          {!collapsed && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">
              TechNexus
            </h2>
          )}
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent group relative',
                pathname === route.href
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? route.label : undefined}
            >
              <route.icon className={cn("h-5 w-5 shrink-0", collapsed ? "mr-0" : "")} />
              {!collapsed && <span>{route.label}</span>}
            </Link>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn("w-full gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10", collapsed ? "justify-center px-2" : "justify-start")}
          onClick={() => signOut({ callbackUrl: '/' })}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  )
}
