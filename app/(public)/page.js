import { CategoryList } from "@/components/home/category-list"
import { FeaturedBlogs } from "@/components/home/featured-blogs"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { HomeWrapper } from "@/components/home/home-wrapper"
import { NewArrivals } from "@/components/home/new-arrivals"
import { TrendingProducts } from "@/components/home/trending-products"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const trendingProducts = await db.product.findMany({
    where: { isTrending: true },
    take: 10,
    include: { category: true }
  })

  const newArrivals = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { category: true }
  })

  const banners = await db.banner.findMany({
    where: { isActive: true }
  })

  const categories = await db.category.findMany({
    where: { isFeatured: true },
    orderBy: { name: 'asc' }
  })

  const featuredBlogs = await db.blog.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  })

  return (
    <HomeWrapper>
      <HeroCarousel banners={banners} />
      
      <div className="container mx-auto px-4 space-y-24 relative">
        <CategoryList categories={categories} />
        <TrendingProducts products={trendingProducts} />
        <NewArrivals products={newArrivals} />
        <FeaturedBlogs blogs={featuredBlogs} />
      </div>
    </HomeWrapper>
  )
}
