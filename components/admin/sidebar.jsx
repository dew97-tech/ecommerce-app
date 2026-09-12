'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/common/user-avatar'
import { siteConfig } from '@/lib/site-config'
import { cn } from '@/lib/utils'
import {
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  PanelLeftClose,
  PenLine,
  ShoppingCart,
  Star,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package, badgeKey: 'lowStock' },
      { label: 'Categories', href: '/admin/categories', icon: FolderTree },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, badgeKey: 'pendingOrders' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Content Studio', href: '/admin/content', icon: PenLine },
      { label: 'Blogs', href: '/admin/blogs', icon: FileText },
      { label: 'Comments', href: '/admin/comments', icon: MessageSquare },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
    ],
  },
]

function isActiveRoute(pathname, href) {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar({ collapsed = false, counts = {}, onToggle }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const badges = {
    pendingOrders: counts.pendingOrders ?? 0,
    lowStock: counts.lowStock ?? 0,
  }

  return (
    <div className="flex h-full w-full flex-col bg-card">

      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-4',
          collapsed && 'justify-center px-2'
        )}
      >
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/icon.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-lg"
          />
          {!collapsed && (
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-base font-bold text-foreground">
                {siteConfig.name}
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Admin
              </span>
            </span>
          )}
        </Link>

        {!collapsed && onToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto hidden h-8 w-8 text-muted-foreground md:inline-flex"
            onClick={onToggle}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className={cn('space-y-5 py-4', collapsed ? 'px-2' : 'px-3')}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </p>
              )}

              {group.items.map((item) => {
                const active = isActiveRoute(pathname, item.href)
                const badge = item.badgeKey ? badges[item.badgeKey] : 0

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      collapsed && 'justify-center px-2',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {active && (
                      <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />
                    )}
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge > 0 && (
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                              active
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badge > 0 && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-price" />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className={cn('shrink-0 border-t border-border p-3', collapsed && 'px-2')}>
        {session?.user && (
          <div
            className={cn(
              'mb-2 flex min-w-0 items-center gap-2.5 px-1',
              collapsed && 'justify-center px-0'
            )}
          >
            <UserAvatar
              name={session.user.name}
              image={session.user.image}
              className="h-8 w-8 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {session.user.name || 'Admin'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            )}
          </div>
        )}

        <div className={cn('flex items-center gap-1', collapsed && 'justify-center')}>
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            className={cn(
              'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
              collapsed ? 'h-8 w-8' : 'w-full justify-start gap-2'
            )}
            onClick={() => signOut({ callbackUrl: '/' })}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  )
}
