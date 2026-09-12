import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "About Us",
  description:
    "Learn about RigNexus, our mission and why customers across Bangladesh shop with us for computer parts and custom PC builds.",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            About RigNexus
          </h1>
          <p className="text-muted-foreground mb-8">Learn more about our mission and values</p>

          <Card className="border border-border bg-card mb-6">
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                RigNexus is Bangladesh&apos;s computer parts and tech marketplace, dedicated to providing quality products at competitive prices. Founded with a vision to make online shopping accessible and convenient for everyone in Bangladesh.
              </p>
              <p>
                We believe in delivering not just products, but experiences that enhance your lifestyle. Our commitment to customer satisfaction drives everything we do.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card mb-6">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To revolutionize online shopping in Bangladesh by offering a seamless, secure, and enjoyable shopping experience with a wide range of quality products delivered right to your doorstep.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle>Why Choose Us?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Wide selection of quality products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Competitive prices and regular discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Fast and reliable delivery across Bangladesh</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Secure payment options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Excellent customer support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
