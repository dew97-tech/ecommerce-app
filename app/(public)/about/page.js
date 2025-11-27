import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            About BD Shop
          </h1>
          <p className="text-muted-foreground mb-8">Learn more about our mission and values</p>

          <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80 mb-6">
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                BD Shop is Bangladesh's premier online marketplace, dedicated to providing quality products at competitive prices. Founded with a vision to make online shopping accessible and convenient for everyone in Bangladesh.
              </p>
              <p>
                We believe in delivering not just products, but experiences that enhance your lifestyle. Our commitment to customer satisfaction drives everything we do.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80 mb-6">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To revolutionize online shopping in Bangladesh by offering a seamless, secure, and enjoyable shopping experience with a wide range of quality products delivered right to your doorstep.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80">
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
