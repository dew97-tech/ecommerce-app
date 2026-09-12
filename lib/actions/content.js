"use server"

import { requireAdmin } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { CORE_CATEGORIES, getPriceInsights } from "@/lib/content/insights"
import { generateArticleProse } from "@/lib/content/gemini"
import { buildPriceWatchArticle } from "@/lib/content/templates"
import { db } from "@/lib/db"
import { revalidatePath, revalidateTag } from "next/cache"

export async function generateContentReports({
  categories,
  windowDays = 30,
  useGemini = true,
} = {}) {
  await requireAdmin()

  const selected =
    Array.isArray(categories) && categories.length > 0
      ? CORE_CATEGORIES.filter((category) => categories.includes(category.slug))
      : CORE_CATEGORIES

  if (selected.length === 0) {
    return { message: "No matching categories.", results: [] }
  }

  const author = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  })

  if (!author) {
    return { message: "No admin user available to author posts.", results: [] }
  }

  const insights = await getPriceInsights({ categories: selected, windowDays })
  const results = []

  for (const insight of insights.categories) {
    if (insight.insufficient) {
      results.push({
        category: insight.label,
        status: "skipped",
        message: `Only ${insight.sample} usable change(s).`,
      })
      continue
    }

    try {
      const prose = useGemini
        ? await generateArticleProse(insight, { windowDays })
        : null
      const article = buildPriceWatchArticle(insight, { windowDays, prose })

      const existing = await db.blog.findUnique({
        where: { slug: article.slug },
        select: { id: true, status: true },
      })

      if (existing?.status === "PUBLISHED") {
        results.push({
          category: insight.label,
          status: "published",
          slug: article.slug,
        })
        continue
      }

      const data = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        generatedBy: prose ? "price-report+gemini" : "price-report",
        sourceData: prose
          ? { ...article.sourceData, gemini: { model: prose.model } }
          : article.sourceData,
      }

      const blog = existing
        ? await db.blog.update({ where: { id: existing.id }, data })
        : await db.blog.create({
            data: {
              ...data,
              slug: article.slug,
              status: "DRAFT",
              authorId: author.id,
            },
          })

      results.push({
        category: insight.label,
        status: existing ? "updated" : "created",
        slug: article.slug,
        id: blog.id,
      })
    } catch (error) {
      console.error("Content generation failed for", insight.label, error)
      results.push({
        category: insight.label,
        status: "error",
        message: error.message,
      })
    }
  }

  revalidateTag(CACHE_TAGS.blogs, "max")
  revalidatePath("/admin/content")
  revalidatePath("/admin/blogs")

  const created = results.filter((result) => result.status === "created").length
  const updated = results.filter((result) => result.status === "updated").length
  const skipped = results.filter(
    (result) => result.status === "skipped" || result.status === "published"
  ).length

  return {
    message: `Generated ${created} new draft(s), updated ${updated}, skipped ${skipped}.`,
    results,
  }
}

export async function publishDueContent() {
  await requireAdmin()

  const now = new Date()
  const due = await db.blog.findMany({
    where: { status: "DRAFT", scheduledAt: { lte: now } },
    select: { id: true },
  })

  if (due.length === 0) {
    return { message: "No scheduled posts are due.", count: 0 }
  }

  await db.blog.updateMany({
    where: { id: { in: due.map((blog) => blog.id) } },
    data: { status: "PUBLISHED", publishedAt: now, scheduledAt: null },
  })

  revalidateTag(CACHE_TAGS.blogs, "max")
  revalidatePath("/")
  revalidatePath("/blogs")
  revalidatePath("/admin/content")
  revalidatePath("/admin/blogs")

  return { message: `Published ${due.length} scheduled post(s).`, count: due.length }
}
