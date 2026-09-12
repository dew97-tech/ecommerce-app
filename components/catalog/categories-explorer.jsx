"use client";

import { CategoryTile } from "@/components/catalog/category-tile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

function matches(name, term) {
  return String(name).toLowerCase().includes(term);
}

export function CategoriesExplorer({ departments = [], categoryCount = 0 }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const isSearching = term.length > 0;
  const searchPlaceholder = categoryCount
    ? `Search ${categoryCount} categories...`
    : "Search categories...";

  const results = useMemo(() => {
    if (!term) {
      return departments.map((department) => ({
        ...department,
        selfMatched: false,
      }));
    }

    return departments
      .map((department) => {
        const selfMatched = matches(department.name, term);
        const matchedChildren = department.children.filter((child) =>
          matches(child.name, term)
        );

        if (!selfMatched && matchedChildren.length === 0) return null;

        return {
          ...department,
          selfMatched,
          children:
            selfMatched && matchedChildren.length === 0
              ? department.children
              : matchedChildren,
        };
      })
      .filter(Boolean);
  }, [departments, term]);

  const matchCount = results.reduce(
    (sum, department) =>
      sum + department.children.length + (department.selfMatched ? 1 : 0),
    0
  );

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 pr-9"
            aria-label="Search categories"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isSearching && (
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {departments.map((department) => (
              <a
                key={department.id}
                href={`#dept-${department.id}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
              >
                {department.name}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {department.totalCount}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {!isSearching && (
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Departments
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with a department, then narrow down by subcategory.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {departments.map((department) => (
              <Link
                key={department.id}
                href={`/categories/${department.id}`}
                className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <CategoryTile
                    name={department.name}
                    image={department.image}
                    className="h-12 w-12"
                    iconClassName="h-6 w-6"
                    sizes="48px"
                  />
                  <span className="text-xs text-muted-foreground">
                    {department.totalCount.toLocaleString("en-US")} items
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">
                  {department.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {department.children
                    .slice(0, 4)
                    .map((child) => child.name)
                    .join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.map((department) => (
        <section
          key={department.id}
          id={`dept-${department.id}`}
          className="scroll-mt-40 space-y-4"
        >
          <header className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <CategoryTile
                name={department.name}
                image={department.image}
                className="h-10 w-10"
                iconClassName="h-5 w-5"
                sizes="40px"
              />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {department.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {department.children.length} subcategories ·{" "}
                  {department.totalCount.toLocaleString("en-US")} products
                </p>
              </div>
            </div>

            <Link
              href={`/categories/${department.id}`}
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </header>

          {department.children.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {department.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <CategoryTile
                    name={child.name}
                    image={child.image}
                    className="h-10 w-10"
                    iconClassName="h-5 w-5"
                    sizes="40px"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {child.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {child.productCount.toLocaleString("en-US")} products
                      {isSearching ? ` · ${department.name}` : ""}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Browse all products in this department.
            </p>
          )}
        </section>
      ))}

      {isSearching && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No categories match “{query}”.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => setQuery("")}
          >
            Clear search
          </Button>
        </div>
      )}

      {isSearching && results.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {matchCount} matching {matchCount === 1 ? "category" : "categories"}
        </p>
      )}
    </div>
  );
}
