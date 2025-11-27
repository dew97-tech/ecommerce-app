'use client'

import { FadeIn } from "@/components/animations/fade-in"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import {
    Camera,
    Grid3x3,
    Headphones,
    Keyboard,
    Laptop,
    Monitor,
    Mouse,
    Smartphone,
    Speaker,
    Tablet,
    Tv,
    Watch
} from "lucide-react"
import Link from "next/link"

// Helper to get icon based on category name
const getCategoryIcon = (name) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('phone') || lowerName.includes('mobile')) return <Smartphone className="h-8 w-8" />
  if (lowerName.includes('laptop') || lowerName.includes('computer')) return <Laptop className="h-8 w-8" />
  if (lowerName.includes('headphone') || lowerName.includes('audio')) return <Headphones className="h-8 w-8" />
  if (lowerName.includes('watch') || lowerName.includes('wearable')) return <Watch className="h-8 w-8" />
  if (lowerName.includes('camera') || lowerName.includes('photo')) return <Camera className="h-8 w-8" />
  if (lowerName.includes('speaker') || lowerName.includes('sound')) return <Speaker className="h-8 w-8" />
  if (lowerName.includes('monitor') || lowerName.includes('display')) return <Monitor className="h-8 w-8" />
  if (lowerName.includes('keyboard')) return <Keyboard className="h-8 w-8" />
  if (lowerName.includes('mouse')) return <Mouse className="h-8 w-8" />
  if (lowerName.includes('tv') || lowerName.includes('television')) return <Tv className="h-8 w-8" />
  if (lowerName.includes('tablet') || lowerName.includes('ipad')) return <Tablet className="h-8 w-8" />
  
  return <Grid3x3 className="h-8 w-8" />
}

export function CategoryList({ categories }) {
  if (!categories || categories.length === 0) return null

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl backdrop-blur-sm">
            <Grid3x3 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Shop by Category
            </h2>
            <p className="text-muted-foreground">Browse our wide range of collections</p>
          </div>
        </div>
      </FadeIn>
      
      <ScrollArea className="w-full whitespace-nowrap rounded-2xl">
        <div className="flex w-max space-x-6 p-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={`/categories/${category.id}`}>
                <div className="glass w-[160px] h-[160px] flex flex-col items-center justify-center gap-4 p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group">
                  <div className="p-4 bg-secondary/10 rounded-full group-hover:bg-primary/10 transition-colors duration-300">
                    <div className="text-secondary group-hover:text-primary transition-colors duration-300">
                      {getCategoryIcon(category.name)}
                    </div>
                  </div>
                  <span className="font-semibold text-sm truncate w-full text-center group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  )
}
