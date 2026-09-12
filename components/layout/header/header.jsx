"use client";

import { MegaMenuPanel } from "@/components/layout/header/mega-menu-panel";
import { MobileMenu } from "@/components/layout/header/mobile-menu";
import { UtilityBar } from "@/components/layout/header/utility-bar";
import { ModeToggle } from "@/components/common/mode-toggle";
import { SearchBar } from "@/components/layout/header/search-bar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/common/user-avatar";
import { siteConfig } from "@/lib/site-config";
import { useIsMounted } from "@/lib/use-is-mounted";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Monitor, Package, ShoppingCart, User, UserCircle } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const OPEN_DELAY_MS = 160;
const CLOSE_DELAY_MS = 200;
const CONDENSE_OFFSET = 100;

export function Header({ navData = [] }) {
  const isMounted = useIsMounted();
  const prefersReducedMotion = useReducedMotion();
  const { data: session } = useSession();

  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const [panel, setPanel] = useState(null);
  const [isCondensed, setIsCondensed] = useState(false);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const panelRef = useRef(null);
  const categoryStripRef = useRef(null);
  const activeTriggerRef = useRef(null);
  const navTriggerRefs = useRef([]);

  const barRoots = useMemo(() => {
    const preferred = siteConfig.primaryNavCategories
      .map((name) =>
        navData.find((root) => root.name.toLowerCase() === name.toLowerCase())
      )
      .filter(Boolean);

    const remaining = navData.filter((root) => !preferred.includes(root));
    return [...preferred, ...remaining].filter(
      (root) => root.productCount > 0
    );
  }, [navData]);

  const isOpen = panel !== null;
  const isAllCategoriesOpen = isOpen && panel.showRootList;

  const clearTimers = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  const openPanel = useCallback(
    (next, trigger) => {
      clearTimers();
      activeTriggerRef.current = trigger ?? null;
      setPanel(next);
    },
    [clearTimers]
  );

  const scheduleOpen = useCallback(
    (next) => {
      clearTimers();
      openTimer.current = setTimeout(() => setPanel(next), OPEN_DELAY_MS);
    },
    [clearTimers]
  );

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setPanel(null), CLOSE_DELAY_MS);
  }, [clearTimers]);

  const closePanel = useCallback(() => {
    clearTimers();
    setPanel(null);
  }, [clearTimers]);

  const togglePanel = useCallback(
    (next, trigger) => {
      clearTimers();
      if (isOpen) {
        setPanel(null);
        return;
      }
      activeTriggerRef.current = trigger ?? null;
      setPanel(next);
    },
    [clearTimers, isOpen]
  );

  const focusFirstPanelItem = useCallback(() => {
    requestAnimationFrame(() => {
      panelRef.current?.querySelector("a, button")?.focus();
    });
  }, []);

  const handleTriggerKeyDown = useCallback(
    (event, next, trigger) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      if (isOpen) {
        focusFirstPanelItem();
        return;
      }
      openPanel(next, trigger);
      focusFirstPanelItem();
    },
    [focusFirstPanelItem, isOpen, openPanel]
  );

  const handleNavArrowKeys = useCallback((event, index) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    const triggers = navTriggerRefs.current.filter(Boolean);
    if (triggers.length === 0) return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + triggers.length) % triggers.length;
    triggers[nextIndex]?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePanel();
        activeTriggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closePanel]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setIsCondensed(window.scrollY > CONDENSE_OFFSET);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const strip = categoryStripRef.current;
    if (!strip) return;

    const handleWheel = (event) => {
      if (strip.scrollWidth <= strip.clientWidth) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const multiplier =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;

      event.preventDefault();
      window.scrollBy({ top: event.deltaY * multiplier, left: 0 });
    };

    strip.addEventListener("wheel", handleWheel, { passive: false });
    return () => strip.removeEventListener("wheel", handleWheel);
  }, [navData.length]);

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background transition-[top] duration-200 ease-out",
        isCondensed && "lg:-top-[100px]"
      )}
      onMouseLeave={scheduleClose}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="header-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-0 bg-slate-950/20"
            onClick={closePanel}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        className="relative z-30 border-b border-border bg-background"
        onMouseEnter={closePanel}
      >
        <UtilityBar />
      </div>

      <div
        className="relative z-40 border-b border-border bg-background"
        onMouseEnter={closePanel}
      >
        <div className="container mx-auto flex h-15 items-center gap-4 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/icon.svg"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-lg"
            />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {siteConfig.tagline}
              </span>
            </span>
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar onActivate={closePanel} />
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
              <Link href="/pc-builder">
                <Monitor className="mr-2 h-4 w-4" />
                PC Builder
              </Link>
            </Button>

            <ModeToggle />

            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/cart" aria-label={`Cart with ${totalItems} items`}>
                <ShoppingCart className="h-5 w-5" />
                {isMounted && totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-price px-1 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>

            {isMounted && session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="overflow-hidden rounded-full border border-border p-0"
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
                          {session.user.name || "User"}
                        </p>
                        <p className="mt-1 truncate text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isMounted ? (
              <div className="hidden items-center gap-1.5 sm:flex">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" aria-hidden="true">
                <User className="h-5 w-5" />
              </Button>
            )}

            <MobileMenu navData={navData} />
          </div>
        </div>
      </div>

      {navData.length > 0 && (
        <nav
          className="relative z-30 hidden border-b border-border bg-background lg:block"
          aria-label="Product categories"
          onMouseLeave={scheduleClose}
        >
          <div className="container mx-auto flex h-11 items-center gap-0.5 px-4 text-[13px] font-medium">
            <button
              ref={(node) => {
                navTriggerRefs.current[0] = node;
              }}
              type="button"
              onClick={(event) =>
                togglePanel(
                  { rootId: null, showRootList: true },
                  event.currentTarget
                )
              }
              onMouseEnter={() =>
                scheduleOpen({ rootId: null, showRootList: true })
              }
              onKeyDown={(event) => {
                handleTriggerKeyDown(
                  event,
                  { rootId: null, showRootList: true },
                  event.currentTarget
                );
                handleNavArrowKeys(event, 0);
              }}
              aria-expanded={isAllCategoriesOpen}
              aria-haspopup="true"
              className={cn(
                "relative flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 transition-colors",
                isAllCategoriesOpen
                  ? "text-primary"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <Menu className="h-4 w-4" />
              All Categories
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isAllCategoriesOpen && "rotate-180"
                )}
              />
              {isAllCategoriesOpen && (
                <motion.span
                  layoutId="category-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                  transition={panelTransition}
                />
              )}
            </button>

            <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />

            <div className="relative min-w-0 flex-1">
              <div
                ref={categoryStripRef}
                className="no-scrollbar flex h-11 items-center gap-0.5 overflow-x-auto"
              >
                {barRoots.map((root, index) => {
                  const isActive =
                    isOpen && panel.rootId === root.id && !panel.showRootList;

                  return (
                    <button
                      key={root.id}
                      ref={(node) => {
                        navTriggerRefs.current[index + 1] = node;
                      }}
                      type="button"
                      onClick={(event) =>
                        togglePanel(
                          { rootId: root.id, showRootList: false },
                          event.currentTarget
                        )
                      }
                      onMouseEnter={() =>
                        scheduleOpen({ rootId: root.id, showRootList: false })
                      }
                      onKeyDown={(event) => {
                        handleTriggerKeyDown(
                          event,
                          { rootId: root.id, showRootList: false },
                          event.currentTarget
                        );
                        handleNavArrowKeys(event, index + 1);
                      }}
                      aria-expanded={isActive}
                      aria-haspopup="true"
                      className={cn(
                        "relative h-9 shrink-0 whitespace-nowrap rounded-md px-2.5 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {root.name}
                      {isActive && (
                        <motion.span
                          layoutId="category-underline"
                          className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                          transition={panelTransition}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent"
                aria-hidden="true"
              />
            </div>

            <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />

            <Link
              href="/products?sort=newest"
              className="flex h-9 shrink-0 items-center rounded-md px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              New Arrivals
            </Link>
          </div>
        </nav>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mega-panel"
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, height: 0, y: -8 }
            }
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, height: 0, y: -8 }
            }
            transition={panelTransition}
            className="absolute inset-x-0 top-full z-20 overflow-hidden shadow-xl shadow-slate-950/10"
            onMouseEnter={clearTimers}
            onMouseLeave={scheduleClose}
          >
            <MegaMenuPanel
              navData={navData}
              activeRootId={panel.rootId}
              showRootList={panel.showRootList}
              onNavigate={closePanel}
              containerRef={panelRef}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
