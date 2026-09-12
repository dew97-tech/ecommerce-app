"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminTopbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const term = query.trim();
    router.push(
      term
        ? `/admin/products?query=${encodeURIComponent(term)}`
        : "/admin/products"
    );
  };

  return (
    <form onSubmit={handleSubmit} className="relative hidden w-64 lg:block">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products..."
        className="h-9 pl-8"
        aria-label="Search products"
      />
    </form>
  );
}
