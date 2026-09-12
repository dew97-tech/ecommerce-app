import { siteConfig } from "@/lib/site-config";
import { BadgeCheck, Headphones, Truck } from "lucide-react";
import Link from "next/link";

export function UtilityBar() {
  return (
    <div className="border-b border-slate-800 bg-slate-900 text-slate-200">
      <div className="container mx-auto flex h-9 items-center justify-between gap-4 px-4 text-xs">
        <div className="flex min-w-0 items-center gap-4">
          <a
            href={`tel:${siteConfig.supportPhone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 font-medium transition-colors hover:text-white"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span className="truncate">Hotline: {siteConfig.supportPhone}</span>
          </a>
          <span className="hidden items-center gap-1.5 lg:flex">
            <BadgeCheck className="h-3.5 w-3.5" />
            {siteConfig.emiNote}
          </span>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            {siteConfig.freeDeliveryNote}
          </span>
          <Link href="/orders" className="transition-colors hover:text-white">
            Track Order
          </Link>
          <Link href="/blogs" className="transition-colors hover:text-white">
            Blog
          </Link>
          <Link href="/contact" className="transition-colors hover:text-white">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
