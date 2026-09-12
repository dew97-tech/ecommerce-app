"use client";

import { CategoryIcon } from "@/components/catalog/category-icon";
import { getSellingPrice } from "@/lib/price";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";

export function MegaMenuPanel({
  navData,
  activeRootId,
  showRootList,
  onNavigate,
  containerRef,
}) {
  const prefersReducedMotion = useReducedMotion();

  const visibleRoots = useMemo(
    () => navData.filter((root) => root.productCount > 0),
    [navData]
  );
  const [activeId, setActiveId] = useState(
    activeRootId ?? visibleRoots[0]?.id
  );

  const resolvedActiveId = showRootList
    ? activeId
    : activeRootId ?? activeId;
  const activeRoot =
    visibleRoots.find((root) => root.id === resolvedActiveId) ?? visibleRoots[0];

  if (!activeRoot) return null;

  const visibleChildren = activeRoot.children.filter(
    (child) => child.productCount > 0
  );

  const contentMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.18, ease: "easeOut" },
      };

  return (
    <div ref={containerRef} className="border-b border-border bg-popover">
      <div className={cn("container mx-auto flex", showRootList && "min-h-[360px]")}>
        {showRootList && (
          <aside className="thin-scrollbar hidden max-h-[70vh] w-64 shrink-0 overflow-y-auto border-r border-border bg-muted/30 py-4 md:block">
            <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shop by category
            </p>
            <div className="space-y-0.5 px-2">
              {visibleRoots.map((root) => {
                const isActive = activeRoot.id === root.id;

                return (
                  <Link
                    key={root.id}
                    href={`/categories/${root.id}`}
                    onMouseEnter={() => setActiveId(root.id)}
                    onFocus={() => setActiveId(root.id)}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <CategoryIcon name={root.name} className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{root.name}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isActive ? "translate-x-0.5 opacity-90" : "opacity-40"
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          </aside>
        )}

        <motion.div
          key={activeRoot.id}
          {...contentMotion}
          className="grid flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-8">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CategoryIcon name={activeRoot.name} className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-semibold leading-none text-foreground">
                    {activeRoot.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeRoot.productCount} products
                  </p>
                </div>
              </div>
              <Link
                href={`/categories/${activeRoot.id}`}
                onClick={onNavigate}
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {visibleChildren.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-0.5 md:grid-cols-3">
                {visibleChildren.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.id}`}
                    onClick={onNavigate}
                    className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <span className="truncate">{child.name}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground transition-colors group-hover:bg-background">
                      {child.productCount}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href={`/categories/${activeRoot.id}`}
                onClick={onNavigate}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Browse all {activeRoot.productCount} products
              </Link>
            )}
          </div>

          <div className="border-t border-border pt-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Popular in {activeRoot.name}
            </p>

            {activeRoot.products.length > 0 ? (
              <div className="space-y-1">
                {activeRoot.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onNavigate}
                    className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-accent hover:shadow-sm"
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1 transition-transform group-hover:scale-105"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-xs font-medium leading-snug text-foreground group-hover:text-primary">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-price">
                        ৳{getSellingPrice(product).toLocaleString("en-US")}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No products yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
