import { FadeIn } from "@/components/animations/fade-in"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/db"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <FadeIn>
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Browse Categories</h1>
            <p className="text-muted-foreground">Explore our wide range of product categories</p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <FadeIn key={category.id} delay={index * 0.05}>
              <Link href={`/categories/${category.id}`}>
                <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-card hover:scale-105 h-full">
                  <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
                      {category.icon || '📦'}
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}
