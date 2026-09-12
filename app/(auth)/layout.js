import { siteConfig } from "@/lib/site-config"
import { Headphones, ShieldCheck, Truck, Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Genuine products with official warranty" },
  { icon: Wallet, label: siteConfig.emiNote },
  { icon: Truck, label: siteConfig.freeDeliveryNote },
  { icon: Headphones, label: `Support hotline ${siteConfig.supportPhone}` },
]

function BrandMark({ compact = false }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        className={
          compact
            ? "flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            : "flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground"
        }
      >
        R
      </span>
      <span className={compact ? "font-bold text-foreground" : "text-lg font-bold text-white"}>
        {siteConfig.name}
      </span>
    </Link>
  )
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">

      <aside className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col">
        <Image
          src="/banners/laptop-mobile.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <BrandMark />

          <div className="max-w-md space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                {siteConfig.tagline}
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
                Genuine PC parts, laptops and gear — with real after-sales support.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Manage your orders, track deliveries and build your next PC from
                one account.
              </p>
            </div>

            <ul className="space-y-3">
              {TRUST_POINTS.map((point) => (
                <li key={point.label} className="flex items-center gap-3 text-sm text-slate-200">
                  <point.icon className="h-4 w-4 shrink-0 text-primary" />
                  {point.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <header className="flex items-center px-5 py-5 lg:hidden">
          <BrandMark compact />
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </main>
    </div>
  )
}
