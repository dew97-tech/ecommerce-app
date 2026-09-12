"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { FilterSections } from "./filter-sections";
import { useFilterNavigation } from "./filter-utils";

export function FilterDrawer({ facets, resultCount = 0 }) {
  const [open, setOpen] = useState(false);
  const { clearAll } = useFilterNavigation();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filters
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-[320px] flex-col p-0 sm:w-[380px]">
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle className="text-lg">Filters</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-2">
            <FilterSections facets={facets} />
          </div>

          <div className="flex gap-2 border-t border-border p-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                clearAll();
                setOpen(false);
              }}
            >
              Clear all
            </Button>
            <Button type="button" className="flex-1" onClick={() => setOpen(false)}>
              Show {resultCount} results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
