'use client'

import { FadeIn } from "@/components/animations/fade-in"
import { ProductCard } from "@/components/product-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"

export function TrendingProducts({ products }) {
  if (!products || products.length === 0) return null

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-2xl backdrop-blur-sm">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Trending Now
            </h2>
            <p className="text-muted-foreground">Hot products everyone is buying</p>
          </div>
        </div>
      </FadeIn>
      
      <ScrollArea className="w-full whitespace-nowrap rounded-2xl">
        <div className="flex w-max space-x-6 p-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-[280px]"
            >
              <div className="glass h-full p-2 hover:border-primary/30 transition-colors duration-300">
                <ProductCard product={product} />
              </div>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  )
}
