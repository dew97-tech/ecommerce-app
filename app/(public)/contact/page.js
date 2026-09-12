import { ContactForm } from "@/components/contact/contact-form"
import { siteConfig } from "@/lib/site-config"
import { ChevronRight, Clock, Mail, MapPin, Monitor, Package, Phone } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Contact Us",
  description: `Contact ${siteConfig.name} — showroom address, support phone, email and working hours.`,
  alternates: { canonical: "/contact" },
}

const QUICK_LINKS = [
  { href: "/orders", label: "Track your order", icon: Package },
  { href: "/pc-builder", label: "Build a custom PC", icon: Monitor },
  { href: "/faq", label: "Read the FAQs", icon: ChevronRight },
]

export default function ContactPage() {
  const channels = [
    {
      icon: MapPin,
      label: "Visit us",
      value: siteConfig.address,
    },
    {
      icon: Phone,
      label: "Call us",
      value: siteConfig.supportPhone,
      href: `tel:${siteConfig.supportPhone.replace(/\s/g, "")}`,
    },
    {
      icon: Mail,
      label: "Email us",
      value: siteConfig.supportEmail,
      href: `mailto:${siteConfig.supportEmail}`,
    },
    {
      icon: Clock,
      label: "Working hours",
      value: siteConfig.hours,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <nav
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">Contact Us</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Questions about a product, an order or a custom build? Send us a
          message or reach the team directly — we usually reply within one
          business day.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Send us a message
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fields marked with an asterisk are required.
          </p>
          <ContactForm />
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Reach us</h2>

            <div className="mt-4 space-y-5">
              {channels.map((channel) => (
                <div key={channel.label} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <channel.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {channel.label}
                    </p>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {channel.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Quick links
            </h2>

            <div className="mt-3 space-y-1">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <span className="flex items-center gap-2.5">
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
