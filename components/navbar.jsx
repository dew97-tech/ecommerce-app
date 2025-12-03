'use client'

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCartStore } from "@/store/useCartStore"
import { BookOpen, Grid3x3, LayoutDashboard, LogOut, Menu, Monitor, Package, Search, ShoppingCart, User, UserCircle } from "lucide-react"
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

  const VISIBLE_COUNT = 6
  const visibleCategories = categoryData?.slice(0, VISIBLE_COUNT) || []
  const hiddenCategories = categoryData?.slice(VISIBLE_COUNT) || []

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="w-full bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-300">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">TechNexus</span>
          </Link>

          {/* Search Bar - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>

            <ModeToggle />

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <ShoppingCart className="h-5 w-5" />
                {isMounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-sm ring-2 ring-background animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            
            {isMounted && session ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="rounded-full border border-border/50 hover:bg-accent/50 overflow-hidden">
                     {session.user.image ? (
                       <img 
                         src={session.user.image} 
                         alt={session.user.name || 'User'} 
                         className="h-full w-full object-cover"
                       />
                     ) : (
                       <User className="h-5 w-5" />
                     )}
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-56 p-2">
                   <DropdownMenuLabel className="font-normal p-2">
                     <div className="flex flex-col space-y-1">
                       <p className="text-sm font-medium leading-none">{session.user.name || 'User'}</p>
                       <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                     </div>
                   </DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <Link href="/profile">
                     <DropdownMenuItem className="cursor-pointer rounded-md">
                       <UserCircle className="mr-2 h-4 w-4" />
                       Profile
                     </DropdownMenuItem>
                   </Link>
                   <Link href="/orders">
                     <DropdownMenuItem className="cursor-pointer rounded-md">
                       <Package className="mr-2 h-4 w-4" />
                       My Orders
                     </DropdownMenuItem>
                   </Link>
                   {session.user.role === 'ADMIN' && (
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer rounded-md text-purple-600 focus:text-purple-600 focus:bg-purple-50 dark:focus:bg-purple-950/20">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </Link>
                   )}
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 rounded-md">
                     <LogOut className="mr-2 h-4 w-4" />
                     Logout
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            ) : isMounted && !session ? (
               <div className="flex items-center gap-2 ml-2">
                 <Link href="/login">
                   <Button variant="ghost" size="sm" className="font-medium">
                      Log in
                   </Button>
                 </Link>
                 <Link href="/signup">
                   <Button size="sm" className="font-medium shadow-md shadow-primary/20">Sign up</Button>
                 </Link>
               </div>
            ) : (
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Menu */}
            {isMounted && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden ml-1">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-6 mt-8">
                    <div className="px-2">
                      <h3 className="font-semibold text-lg mb-4 text-foreground/80">Navigation</h3>
                      <nav className="flex flex-col gap-2">
                        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/50 text-foreground font-medium">
                          <LayoutDashboard className="h-4 w-4" /> Home
                        </Link>
                        <Link href="/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <Package className="h-4 w-4" /> Products
                        </Link>
                        <Link href="/pc-builder" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <Monitor className="h-4 w-4" /> PC Builder
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
      <div className="hidden md:block border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 h-11 text-sm font-medium overflow-x-auto no-scrollbar">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors h-full flex items-center px-4 hover:bg-accent/40 rounded-md whitespace-nowrap">
              Home
            </Link>
            <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors h-full flex items-center px-4 hover:bg-accent/40 rounded-md whitespace-nowrap">
              All Products
            </Link>
            <Link href="/pc-builder" className="text-muted-foreground hover:text-primary transition-colors h-full flex items-center px-4 hover:bg-accent/40 rounded-md whitespace-nowrap font-semibold text-primary/80">
              PC Builder
            </Link>
            
            <div className="w-px h-4 bg-border/50 mx-1" />

            {visibleCategories.map(category => (
                <SingleCategoryMenu key={category.id} category={category} />
            ))}

            {hiddenCategories.length > 0 && (
                <MultiCategoryMenu categories={hiddenCategories} trigger="More Categories" />
            )}

            <div className="flex-1" />

            <Link href="/blogs" className="text-muted-foreground hover:text-primary transition-colors h-full flex items-center px-4 hover:bg-accent/40 rounded-md whitespace-nowrap">
              Blog
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors h-full flex items-center px-4 hover:bg-accent/40 rounded-md whitespace-nowrap">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
