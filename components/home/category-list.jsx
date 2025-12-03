'use client'

import { FadeIn } from "@/components/animations/fade-in"
import { motion } from "framer-motion"
import {
    AppWindow,
    Camera,
    Cpu,
    Gamepad2,
    Grid3x3,
    Headphones,
    Keyboard,
    Laptop,
    Monitor,
    Mouse,
    Printer,
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
  if (lowerName.includes('processor') || lowerName.includes('cpu')) return <Cpu className="h-8 w-8" />
  if (lowerName.includes('gaming') || lowerName.includes('game')) return <Gamepad2 className="h-8 w-8" />
  if (lowerName.includes('printer')) return <Printer className="h-8 w-8" />
  if (lowerName.includes('software')) return <AppWindow className="h-8 w-8" />
  if (lowerName.includes('gpu') || lowerName.includes('graphics')) return <Cpu className="h-8 w-8" /> // Use CPU icon for GPU as generic chip
  
  return <Grid3x3 className="h-8 w-8" />
}

export function CategoryList({ categories }) {
  if (!categories || categories.length === 0) return null

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-2 bg-primary rounded-full" />
             <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Top Categories</h2>
          </div>
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            See all categories
          </Link>
        </div>
      </FadeIn>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={`/categories/${category.id}`}>
              <div className="bg-card hover:border-primary border border-border/40 rounded-xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-lg transition-all duration-300 group h-full">
                <div className="p-3 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors duration-300 text-primary/80 group-hover:text-primary">
                  {getCategoryIcon(category.name)}
                </div>
                <span className="font-medium text-sm text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                  {category.name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
