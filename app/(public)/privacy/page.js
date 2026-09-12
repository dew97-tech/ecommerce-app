import { PolicyPage } from "@/components/policy/policy-page"
import { LEGAL_LAST_UPDATED, PRIVACY_SECTIONS } from "@/lib/content/legal"

export const metadata = {
  title: "Privacy Policy",
  description:
    "How RigNexus collects, uses, shares and protects your personal information, and the rights you have over your data.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      description="How we collect, use, share and protect your personal information, and the choices you have."
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={PRIVACY_SECTIONS}
    />
  )
}
