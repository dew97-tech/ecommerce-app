'use client'

import { AdminTopbarSearch } from '@/components/admin/admin-topbar-search'
import { Sidebar } from '@/components/admin/sidebar'
import { ModeToggle } from "@/components/common/mode-toggle"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAdminUiStore } from '@/store/admin-ui-store'
import { useIsMounted } from '@/lib/use-is-mounted'
import { cn } from '@/lib/utils'
import {
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingCart,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const CRUMB_LABELS = {
  admin: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  banners: 'Banners',
  blogs: 'Blogs',
  comments: 'Comments',
  reviews: 'Reviews',
  new: 'New',
  create: 'Create',
}

export function AdminLayoutClient({ children, counts = {} }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isMounted = useIsMounted()

  const collapsed = useAdminUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    useAdminUiStore.persist.rehydrate()
  }, [])

  const isCollapsed = isMounted ? collapsed : false

  const crumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)

    return segments.map((segment, index) => ({
      label:
        CRUMB_LABELS[segment] ??
        (segment.length > 16 ? 'Details' : segment),
      href: `/${segments.slice(0, index + 1).join('/')}`,
      isLast: index === segments.length - 1,
    }))
  }, [pathname])

  return (
    <div className="min-h-screen bg-muted/20">

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar counts={counts} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          'fixed inset-y-0 z-50 hidden flex-col border-r border-border bg-background transition-[width] duration-200 md:flex',
          isCollapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        <Sidebar
          collapsed={isCollapsed}
          counts={counts}
          onToggle={toggleSidebar}
        />
      </div>

      <main
        className={cn(
          'min-h-screen transition-[padding] duration-200',
          isCollapsed ? 'md:pl-[68px]' : 'md:pl-64'
        )}
      >
        <div className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          <nav
            className="hidden min-w-0 items-center gap-1 text-sm text-muted-foreground sm:flex"
            aria-label="Breadcrumb"
          >
            {crumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex min-w-0 items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                )}
                {crumb.isLast ? (
                  <span className="truncate font-medium text-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <AdminTopbarSearch />

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden text-muted-foreground lg:inline-flex"
            >
              <Link href="/" target="_blank" rel="noreferrer">
                View store
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>

            <ModeToggle />

            {session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-border p-0"
                    aria-label="Account menu"
                  >
                    <UserAvatar
                      name={session.user.name}
                      image={session.user.image}
                      className="h-full w-full"
                      fallbackClassName="bg-transparent"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={session.user.name}
                        image={session.user.image}
                        className="h-9 w-9 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-none">
                          {session.user.name || 'Admin'}
                        </p>
                        <p className="mt-1 truncate text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/orders" className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/"
                      target="_blank"
                      rel="noreferrer"
                      className="cursor-pointer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View store
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="w-full">{children}</div>
      </main>
    </div>
  )
}
