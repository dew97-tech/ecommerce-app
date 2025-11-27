'use client'

import { FadeIn } from "@/components/animations/fade-in"
import { ProductCard } from "@/components/product-card"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function NewArrivals({ products }) {
  if (!products || products.length === 0) return null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl backdrop-blur-sm">
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              New Arrivals
            </h2>
            <p className="text-muted-foreground">Fresh products just added to our store</p>
          </div>
        </div>
      </FadeIn>
      
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={item}>
            <div className="glass h-full p-2 hover:border-primary/30 transition-colors duration-300">
              <ProductCard product={product} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
