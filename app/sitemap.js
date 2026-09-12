import { db } from "@/lib/db";
import { getCategorySubtreeCounts } from "@/lib/catalog/categories";
import { parseImages } from "@/lib/images";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

export default async function sitemap() {
  const [categories, subtreeCounts, products, blogs] = await Promise.all([
    db.category.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { name: "asc" },
    }),
    getCategorySubtreeCounts(),
    db.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        images: true,
        updatedAt: true,
        lastSyncedAt: true,
      },
      orderBy: { id: "asc" },
    }),
    db.blog.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
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
