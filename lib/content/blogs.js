import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/config";
import { db } from "@/lib/db";

export const BLOG_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  imageUrl: true,
  category: true,
  tags: true,
  content: true,
  publishedAt: true,
  createdAt: true,
  author: { select: { name: true } },
};

export function readingTimeMinutes(content) {
  const text = String(content ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

const loadRelatedBlogs = unstable_cache(
  async (blogId, category) => {
    const where = { status: "PUBLISHED", id: { not: blogId } };
    if (category) where.category = category;

    let blogs = await db.blog.findMany({
      where,
      select: BLOG_CARD_SELECT,
      orderBy: { publishedAt: "desc" },
      take: 3,
    });

    if (blogs.length < 3 && category) {
      const extra = await db.blog.findMany({
        where: {
          status: "PUBLISHED",
          id: { not: blogId },
          category: { not: category },
        },
        select: BLOG_CARD_SELECT,
        orderBy: { publishedAt: "desc" },
        take: 3 - blogs.length,
      });
      blogs = [...blogs, ...extra];
    }

    return blogs;
  },
  ["related-blogs"],
  { tags: [CACHE_TAGS.blogs], revalidate: 300 }
);

export const getRelatedBlogs = loadRelatedBlogs;

const loadPopularBlogTags = unstable_cache(
  async () => {
    const blogs = await db.blog.findMany({
      where: { status: "PUBLISHED" },
      select: { tags: true },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });

    const counts = new Map();
    for (const blog of blogs) {
      if (!Array.isArray(blog.tags)) continue;
      for (const tag of blog.tags) {
        if (typeof tag !== "string" || !tag.trim()) continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  },
  ["popular-blog-tags"],
  { tags: [CACHE_TAGS.blogs], revalidate: 300 }
);

export const getPopularBlogTags = loadPopularBlogTags;
