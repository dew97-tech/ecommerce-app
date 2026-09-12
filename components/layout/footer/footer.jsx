import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/lib/site-config"
import { Clock, Mail, MapPin, Phone, ShieldCheck, Truck, Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const QUICK_LINKS = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Blog", href: "/blogs" },
  { name: "RSS Feed", href: "/feed.xml" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "FAQs", href: "/faq" },
]

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Genuine products with warranty" },
  { icon: Wallet, label: siteConfig.emiNote },
  { icon: Truck, label: siteConfig.freeDeliveryNote },
]

export function Footer({ categories = [] }) {
  const displayCategories = categories.slice(0, 6)

  return (
    <footer className="mt-20 border-t border-border bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icon.svg"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-lg"
              />
              <span className="text-lg font-bold tracking-tight">{siteConfig.name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <ul className="space-y-2">
              {TRUST_POINTS.map((point) => (
                <li key={point.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <point.icon className="h-4 w-4 shrink-0 text-primary" />
                  {point.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Categories</h4>
            <ul className="space-y-2">
              {displayCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.id}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Get In Touch</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{siteConfig.address}</span>
              </p>
              <a
                href={`tel:${siteConfig.supportPhone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span>{siteConfig.supportPhone}</span>
              </a>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>{siteConfig.supportEmail}</span>
              </a>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{siteConfig.hours}</span>
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="transition-colors hover:text-primary">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link href="/faq" className="transition-colors hover:text-primary">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
