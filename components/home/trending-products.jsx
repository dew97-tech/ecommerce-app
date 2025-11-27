import { FadeIn } from "@/components/animations/fade-in"
import { ProductCard } from "@/components/product-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Flame } from "lucide-react"

export function TrendingProducts({ products }) {
  if (!products || products.length === 0) return null

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
            <p className="text-muted-foreground text-sm">Hot products everyone is buying</p>
          </div>
        </div>
      </FadeIn>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-card/50 backdrop-blur-sm">
        <div className="flex w-max space-x-4 p-4">
          {products.map((product, index) => (
            <FadeIn key={product.id} delay={index * 0.05}>
              <div className="w-[250px]">
                <ProductCard product={product} />
              </div>
            </FadeIn>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
