'use client'

import { FadeIn } from "@/components/animations/fade-in"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Grid3x3 } from "lucide-react"
import Link from "next/link"

export function CategoryList({ categories }) {
  if (!categories || categories.length === 0) return null

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Grid3x3 className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground text-sm">Browse products by category</p>
          </div>
        </div>
      </FadeIn>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-card/50 backdrop-blur-sm">
        <div className="flex w-max space-x-4 p-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link href={`/categories/${category.id}`}>
                <Card className="w-[150px] hover:shadow-lg transition-all duration-300 cursor-pointer group border-none bg-card/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {category.icon || '📦'}
                    </span>
                    <span className="font-medium text-sm truncate w-full text-center group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
