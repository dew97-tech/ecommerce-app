"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export function FaqExplorer({ categories }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!term) return categories;

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(term) ||
            item.answer.toLowerCase().includes(term)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, term]);

  const matchCount = filtered.reduce(
    (sum, category) => sum + category.items.length,
    0
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions..."
            className="h-10 pl-9 pr-9"
            aria-label="Search frequently asked questions"
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

        {!term && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
              >
                {category.title}
              </a>
            ))}
          </div>
        )}
      </div>

      {matchCount === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No questions match &quot;{query}&quot;.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        filtered.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-24 rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {category.title}
            </h2>

            <Accordion type="single" collapsible className="mt-2 w-full">
              {category.items.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`${category.id}-${index}`}
                >
                  <AccordionTrigger className="text-left text-sm">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))
      )}
    </div>
  );
}
