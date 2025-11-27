'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCartStore } from "@/store/useCartStore"
import { BookOpen, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingCart, User, UserCircle } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function Navbar() {
  const items = useCartStore((state) => state.items)
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const [isMounted, setIsMounted] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="container flex h-16 items-center px-4">
        {isMounted ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent/50">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <nav className="flex flex-col gap-3 mt-8">
                <Link href="/" className="text-base font-medium px-4 py-2 rounded-lg hover:bg-accent transition-colors">Home</Link>
                <Link href="/products" className="text-base font-medium px-4 py-2 rounded-lg hover:bg-accent transition-colors">Products</Link>
                <Link href="/categories" className="text-base font-medium px-4 py-2 rounded-lg hover:bg-accent transition-colors">Categories</Link>
                <Link href="/blogs" className="text-base font-medium px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Blog
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">BD Shop</span>
        </Link>

        <div className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <Link href="/products" className="px-4 py-2 rounded-lg transition-colors hover:bg-accent/50 text-foreground/70 hover:text-foreground">Products</Link>
          <Link href="/categories" className="px-4 py-2 rounded-lg transition-colors hover:bg-accent/50 text-foreground/70 hover:text-foreground">Categories</Link>
          <Link href="/blogs" className="px-4 py-2 rounded-lg transition-colors hover:bg-accent/50 text-foreground/70 hover:text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Blog
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 h-10 bg-accent/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/20 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </div>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
              <ShoppingCart className="h-5 w-5" />
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-lg">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          
          {isMounted && session ? (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                   <User className="h-5 w-5" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56">
                 <DropdownMenuLabel className="font-normal">
                   <div className="flex flex-col space-y-1">
                     <p className="text-sm font-medium leading-none">{session.user.name || 'User'}</p>
                     <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                   </div>
                 </DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <Link href="/profile">
                   <DropdownMenuItem className="cursor-pointer">
                     <UserCircle className="mr-2 h-4 w-4" />
                     Profile
                   </DropdownMenuItem>
                 </Link>
                 <Link href="/orders">
                   <DropdownMenuItem className="cursor-pointer">
                     <Package className="mr-2 h-4 w-4" />
                     Orders
                   </DropdownMenuItem>
                 </Link>
                 {session.user.role === 'ADMIN' && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                 )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 focus:text-red-600">
                   <LogOut className="mr-2 h-4 w-4" />
                   Logout
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          ) : isMounted && !session ? (
             <Link href="/login">
               <Button variant="ghost" size="sm" className="hover:bg-accent/50">Login</Button>
             </Link>
          ) : (
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
