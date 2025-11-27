import { FadeIn } from "@/components/animations/fade-in"
import { ProductCard } from "@/components/product-card"
import { Sparkles } from "lucide-react"

export function NewArrivals({ products }) {
  if (!products || products.length === 0) return null

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">New Arrivals</h2>
            <p className="text-muted-foreground text-sm">Fresh products just added to our store</p>
          </div>
        </div>
      </FadeIn>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <FadeIn key={product.id} delay={index * 0.05}>
            <ProductCard product={product} />
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
