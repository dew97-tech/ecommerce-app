import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache/config";
import { getCategorySubtreeCounts } from "@/lib/catalog/categories";
import { parseImages } from "@/lib/images";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SITEMAP_PRODUCT_CHUNK = 3000;

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/products", priority: 0.9, changeFrequency: "daily" },
  { path: "/categories", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pc-builder", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blogs", priority: 0.6, changeFrequency: "weekly" },
  { path: "/about", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.4, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.4, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
];

const loadSitemapMeta = unstable_cache(
  async () => {
    const [categories, blogs] = await Promise.all([
      db.category.findMany({
        select: { id: true, updatedAt: true },
        orderBy: { name: "asc" },
      }),
      db.blog.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
      }),
    ]);

    return { categories, blogs };
  },
  ["sitemap-meta"],
  {
    tags: [CACHE_TAGS.categories, CACHE_TAGS.blogs],
    revalidate: 300,
  }
);

const loadSitemapProductChunk = unstable_cache(
  async (chunkIndex) =>
    db.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        images: true,
        updatedAt: true,
        lastSyncedAt: true,
      },
      orderBy: { id: "asc" },
      skip: chunkIndex * SITEMAP_PRODUCT_CHUNK,
      take: SITEMAP_PRODUCT_CHUNK,
    }),
  ["sitemap-products"],
  {
    tags: [CACHE_TAGS.products],
    revalidate: 300,
  }
);

async function loadSitemapProducts() {
  const totalCount = await db.product.count({ where: { isActive: true } });
  const chunkCount = Math.ceil(totalCount / SITEMAP_PRODUCT_CHUNK);

  if (chunkCount === 0) return [];

  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, index) =>
      loadSitemapProductChunk(index)
    )
  );

  return chunks.flat();
}

export default async function sitemap() {
  const [{ categories, blogs }, products, subtreeCounts] = await Promise.all([
    loadSitemapMeta(),
    loadSitemapProducts(),
    getCategorySubtreeCounts(),
  ]);

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const categoryEntries = categories
    .filter((category) => (subtreeCounts.get(category.id) ?? 0) > 0)
    .map((category) => ({
      url: `${BASE_URL}/categories/${category.id}`,
      lastModified: category.updatedAt,
      changeFrequency: "daily",
      priority: 0.7,
    }));

  const productEntries = products.map((product) => {
    const images = parseImages(product.images)
      .filter((image) => image.startsWith("http"))
      .slice(0, 2);

    return {
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.lastSyncedAt ?? product.updatedAt,
      changeFrequency: "daily",
      priority: 0.7,
      images,
    };
  });

  const blogEntries = blogs.map((blog) => ({
    url: `${BASE_URL}/blogs/${blog.slug}`,
    lastModified: blog.publishedAt ?? blog.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...productEntries,
    ...blogEntries,
  ];
}
