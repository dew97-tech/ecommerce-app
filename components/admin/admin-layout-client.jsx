'use client'

import { Sidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export function AdminLayoutClient({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 z-50 bg-background border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        <Sidebar collapsed={isCollapsed} />
      </div>

      {/* Main Content */}
      <main 
        className={cn(
          "transition-all duration-300 min-h-screen",
          isCollapsed ? "md:pl-16" : "md:pl-72"
        )}
      >
        {/* Top Navigation Bar */}
        <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 sticky top-0 z-40">
          {/* Mobile Menu Trigger */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop Collapse Trigger */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex mr-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu className="h-5 w-5" />
          </Button>

import { ModeToggle } from "@/components/mode-toggle"

// ... inside AdminLayoutClient

          <div className="ml-auto flex items-center gap-4">
            <ModeToggle />
            {/* Add user menu or other top nav items here if needed */}
          </div>
        </div>

        <div className="p-4 md:p-8 pt-6">
            {children}
        </div>
      </main>
    </div>
  )
}
