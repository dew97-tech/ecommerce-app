'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCartStore } from "@/store/useCartStore"
import { BookOpen, Grid3x3, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingCart, User, UserCircle } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MultiCategoryMenu, SingleCategoryMenu } from "./layout/mega-menu"
import { SearchBar } from "./search-bar"

export function Navbar({ categoryData }) {
  const items = useCartStore((state) => state.items)
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const [isMounted, setIsMounted] = useState(false)
  const { data: session } = useSession()

  const VISIBLE_COUNT = 5
  const visibleCategories = categoryData?.slice(0, VISIBLE_COUNT) || []
  const hiddenCategories = categoryData?.slice(VISIBLE_COUNT) || []

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="w-full bg-background border-b border-border sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight">TechNexus</span>
          </Link>

          {/* Search Bar - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex flex-1 mx-8 justify-center">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" className="relative h-12 w-12 rounded-full border border-border/50 hover:bg-accent hover:text-accent-foreground">
                <ShoppingCart className="h-5 w-5" />
                {isMounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-bold text-primary-foreground flex items-center justify-center shadow-sm ring-2 ring-background">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            
            {isMounted && session ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="relative h-12 w-12 rounded-full border border-border/50 hover:bg-accent hover:text-accent-foreground">
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
                 <Button className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    Login
                 </Button>
               </Link>
            ) : (
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Menu */}
            {isMounted && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <div className="flex flex-col gap-6 mt-8">
                    <div className="px-2">
                      <h3 className="font-semibold text-lg mb-4">Menu</h3>
                      <nav className="flex flex-col gap-2">
                        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/50 text-foreground font-medium">
                          <LayoutDashboard className="h-4 w-4" /> Home
                        </Link>
                        <Link href="/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <Package className="h-4 w-4" /> Products
                        </Link>
                        <Link href="/categories" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <Grid3x3 className="h-4 w-4" /> Categories
                        </Link>
                        <Link href="/blogs" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <BookOpen className="h-4 w-4" /> Blog
                        </Link>
                      </nav>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar - Desktop */}
      <div className="hidden md:block border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8 h-12 text-sm font-medium">
            <Link href="/" className="text-primary border-b-2 border-primary h-full flex items-center px-1">
              Home
            </Link>
            <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors h-full flex items-center px-1">
              All Products
            </Link>
            
            {visibleCategories.map(category => (
                <SingleCategoryMenu key={category.id} category={category} />
            ))}

            {hiddenCategories.length > 0 && (
                <MultiCategoryMenu categories={hiddenCategories} trigger="More" />
            )}

            <Link href="/blogs" className="text-muted-foreground hover:text-primary transition-colors h-full flex items-center px-1">
              Blog
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors h-full flex items-center px-1">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
