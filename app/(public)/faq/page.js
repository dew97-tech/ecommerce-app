import { FaqExplorer } from "@/components/faq/faq-explorer"
import { JsonLd } from "@/components/seo/json-ld"
import { FAQ_CATEGORIES } from "@/lib/content/legal"
import { faqSchema } from "@/lib/seo/structured-data"
import { siteConfig } from "@/lib/site-config"
import { ChevronRight, Mail, Phone } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "FAQ",
  description:
    "Answers about orders, payments, delivery, returns, warranty, products, accounts and the PC Builder at RigNexus.",
  alternates: { canonical: "/faq" },
}

export default function FAQPage() {
  const questions = FAQ_CATEGORIES.flatMap((category) => category.items)

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={faqSchema(questions)} />

      <nav
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">FAQ</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Quick answers about ordering, delivery, payments, returns, warranty,
          accounts and the PC Builder.
        </p>
      </header>

      <FaqExplorer categories={FAQ_CATEGORIES} />

      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Still need help?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Our support team is available {siteConfig.hours}. Reach out and we will
          get back to you as soon as possible.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/contact"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Contact us
          </Link>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            {siteConfig.supportEmail}
          </a>
          <a
            href={`tel:${siteConfig.supportPhone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <Phone className="h-4 w-4" />
            {siteConfig.supportPhone}
          </a>
        </div>
      </div>
    </div>
  )
}
