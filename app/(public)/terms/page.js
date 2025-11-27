import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  By accessing and using BD Shop, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>2. Use License</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  Permission is granted to temporarily download one copy of the materials on BD Shop for personal, non-commercial transitory viewing only.
                </p>
                <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or other proprietary notations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>3. Product Information</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  We strive to provide accurate product information. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>4. Pricing and Payment</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  All prices are in Bangladeshi Taka (৳) and are subject to change without notice. We reserve the right to refuse or cancel any order for any reason.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>5. Shipping and Delivery</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  We aim to deliver products within the estimated timeframe. However, delivery times are not guaranteed and may vary based on location and product availability.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>6. Returns and Refunds</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  We offer a 7-day return policy for most products. Items must be unused, in original packaging, and accompanied by proof of purchase.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
