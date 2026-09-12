import { CategoryList } from "@/components/home/category-list";
import { FeaturedBlogs } from "@/components/home/featured-blogs";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HomeWrapper } from "@/components/home/home-wrapper";
import { NewArrivals } from "@/components/home/new-arrivals";
import { PcBuilderBand } from "@/components/home/pc-builder-band";
import { TrustStrip } from "@/components/home/trust-strip";
import { isCategoryTile } from "@/components/catalog/category-tile";
import { JsonLd } from "@/components/seo/json-ld";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config";
import { PRODUCT_CARD_SELECT } from "@/lib/catalog/selects";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";

export const dynamic = 'force-dynamic'

const loadHomeData = unstable_cache(
  async () => {
    const [newArrivals, banners, rootCategories, featuredBlogs] = await Promise.all([
      db.product.findMany({
        where: { isActive: true, availabilityStatus: "IN_STOCK" },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: PRODUCT_CARD_SELECT,
      }),
      db.banner.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
      db.category.findMany({
        where: { parentId: null },
        select: {
          id: true,
          name: true,
          image: true,
          _count: {
            select: {
              products: {
                where: { isActive: true, availabilityStatus: "IN_STOCK" },
              },
            },
          },
          children: {
            select: {
              _count: {
                select: {
                  products: {
                    where: { isActive: true, availabilityStatus: "IN_STOCK" },
                  },
                },
              },
            },
          },
        },
      }),
      db.blog.findMany({
        where: { status: 'PUBLISHED' },
        take: 3,
        orderBy: { publishedAt: 'desc' },
        include: { author: { select: { name: true, image: true } } },
      }),
    ]);

    const categories = rootCategories
      .map((category) => ({
        id: category.id,
        name: category.name,
        image: category.image,
        _count: {
          products:
            category._count.products +
            category.children.reduce(
              (sum, child) => sum + child._count.products,
              0
            ),
        },
      }))
      .sort((a, b) => {
        const tileDelta =
          Number(isCategoryTile(b.image)) - Number(isCategoryTile(a.image));
        return tileDelta !== 0 ? tileDelta : b._count.products - a._count.products;
      })
      .slice(0, 8);

    return { newArrivals, banners, categories, featuredBlogs };
  },
  ["home-data"],
  {
    tags: [
      CACHE_TAGS.products,
      CACHE_TAGS.banners,
      CACHE_TAGS.categories,
      CACHE_TAGS.blogs,
    ],
    revalidate: staggeredTtl(CACHE_TTL.home),
  }
);

export default async function Home() {
  const { newArrivals, banners, categories, featuredBlogs } =
    await loadHomeData();

  return (
    <HomeWrapper>
      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />

      <HeroCarousel banners={banners} />

      <div className="container mx-auto space-y-16 px-4">
        <TrustStrip />
        <CategoryList categories={categories} />
        <PcBuilderBand />
        <NewArrivals products={newArrivals} />
        <FeaturedBlogs blogs={featuredBlogs} />
      </div>
    </HomeWrapper>
  );
}
