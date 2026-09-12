"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/lib/site-config";
import { BookOpen, Headphones, LayoutDashboard, Mail, Menu, Monitor, Package, Search, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const QUICK_LINKS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/products", label: "All Products", icon: Package },
  { href: "/pc-builder", label: "PC Builder", icon: Monitor },
  { href: "/orders", label: "Track Order", icon: Package },
  { href: "/blogs", label: "Blog", icon: BookOpen },
];

export function MobileMenu({ navData = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products");
    setOpen(false);
  };

  const closeAndNavigate = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex w-[320px] flex-col gap-0 p-0 sm:w-[380px]">
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-lg">Menu</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSearch} className="border-b border-border p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="pl-9"
                aria-label="Search products"
              />
            </div>
          </form>

          <nav className="border-b border-border p-3" aria-label="Main">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeAndNavigate}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <link.icon className="h-4 w-4 text-muted-foreground" />
                {link.label}
              </Link>
            ))}
            <Link
              href="/profile"
              onClick={closeAndNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              My Account
            </Link>
          </nav>

          {navData.length > 0 && (
            <div className="border-b border-border p-3">
              <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shop by category
              </p>
              <Accordion type="single" collapsible className="w-full">
                {navData
                  .filter((root) => root.productCount > 0)
                  .map((root) => (
                  <AccordionItem key={root.id} value={root.id} className="border-b-0">
                    <AccordionTrigger className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent hover:no-underline">
                      {root.name}
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pl-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/categories/${root.id}`}
                          onClick={closeAndNavigate}
                          className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                        >
                          View all {root.name}
                        </Link>
                        {root.children
                          .filter((child) => child.productCount > 0)
                          .map((child) => (
                          <Link
                            key={child.id}
                            href={`/categories/${child.id}`}
                            onClick={closeAndNavigate}
                            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-border bg-muted/40 p-5 text-sm">
          <a
            href={`tel:${siteConfig.supportPhone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 font-medium text-foreground"
          >
            <Headphones className="h-4 w-4 text-muted-foreground" />
            {siteConfig.supportPhone}
          </a>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Mail className="h-4 w-4" />
            {siteConfig.supportEmail}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
