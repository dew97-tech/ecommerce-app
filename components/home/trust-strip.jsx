import { siteConfig } from "@/lib/site-config";
import { Headphones, ShieldCheck, Truck, Wallet } from "lucide-react";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Genuine products",
    description: "Official warranty on every item",
  },
  {
    icon: Wallet,
    title: "Easy EMI",
    description: siteConfig.emiNote,
  },
  {
    icon: Truck,
    title: "Fast delivery",
    description: siteConfig.freeDeliveryNote,
  },
  {
    icon: Headphones,
    title: "Expert support",
    description: `${siteConfig.supportPhone} · ${siteConfig.hours}`,
  },
];

export function TrustStrip() {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-3 bg-card p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
