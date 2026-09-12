import { PolicyPage } from "@/components/policy/policy-page"
import { LEGAL_LAST_UPDATED, TERMS_SECTIONS } from "@/lib/content/legal"

export const metadata = {
  title: "Terms & Conditions",
  description:
    "RigNexus terms and conditions covering accounts, orders, payments, delivery, returns, warranty and liability.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      description="The rules that govern your use of RigNexus, including accounts, orders, payments, delivery, returns, warranty and liability."
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={TERMS_SECTIONS}
    />
  )
}
