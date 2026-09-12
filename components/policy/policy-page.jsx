import { siteConfig } from "@/lib/site-config";
import { ChevronRight, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { PolicyToc } from "./policy-toc";

export function PolicyCallout({ title, text }) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function PolicySection({ section }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 rounded-xl border border-border bg-card p-6"
    >
      <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>

      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {(section.paragraphs ?? []).map((text) => (
          <p key={text}>{text}</p>
        ))}

        {section.list?.length > 0 && (
          <ul className="list-disc space-y-1.5 pl-5">
            {section.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {(section.after ?? []).map((text) => (
          <p key={text}>{text}</p>
        ))}

        {section.callout && <PolicyCallout {...section.callout} />}
      </div>
    </section>
  );
}

export function PolicyPage({ title, description, lastUpdated, sections }) {
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
        <span className="font-medium text-foreground">{title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <PolicyToc sections={sections} />

        <div className="min-w-0 space-y-6">
          {sections.map((section) => (
            <PolicySection key={section.id} section={section} />
          ))}

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Questions about this policy?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reach our support team and we will be happy to explain anything
              in this document.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
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
      </div>
    </div>
  );
}
