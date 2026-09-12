"use server"

import { requireAdmin, requireUser } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import {
  BLOG_CATEGORIES,
  MAX_BLOG_EXCERPT,
  MAX_BLOG_TAGS,
} from "@/lib/content/blog-config"
import { db } from "@/lib/db"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { hasTextContent, sanitizeContentHtml } from "@/lib/sanitize"
import { saveImageFile } from "@/lib/services/upload"
import { revalidatePath, revalidateTag } from "next/cache"

const BLOG_STATUSES = ["DRAFT", "PUBLISHED"]

function resolveStatus(value) {
  return BLOG_STATUSES.includes(value) ? value : "DRAFT"
}

function resolveCategory(value) {
  const text = String(value ?? "").trim()
  return BLOG_CATEGORIES.includes(text) ? text : null
}

function parseTags(value) {
  const tags = String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
  return [...new Set(tags)].slice(0, MAX_BLOG_TAGS)
}

function parseScheduledAt(value) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeExcerpt(value) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim()
  return text ? text.slice(0, MAX_BLOG_EXCERPT) : null
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 120)
}

async function resolveCoverImage(formData) {
  const file = formData.get("imageFile")
  if (file && typeof file !== "string" && file.size > 0) {
    return saveImageFile(file, "blogs")
  }

  const url = formData.get("imageUrl")
  if (typeof url === "string" && url.trim()) {
    return url.trim()
  }

  return null
}

function revalidateBlogPaths(slug) {
  revalidatePath("/admin/blogs")
  revalidatePath("/")
  revalidatePath("/blogs")
  if (slug) revalidatePath(`/blogs/${slug}`)
  revalidateTag(CACHE_TAGS.blogs, "max")
}

export async function createBlog(formData) {
  const user = await requireAdmin()

  const title = String(formData.get("title") ?? "").trim()
  const rawContent = String(formData.get("content") ?? "")
  const status = resolveStatus(formData.get("status"))

  if (!title) {
    throw new Error("A title is required.")
  }

  if (status === "PUBLISHED" && !hasTextContent(rawContent)) {
    throw new Error("Add some content before publishing.")
  }

  const content = sanitizeContentHtml(rawContent)
  const imageUrl = await resolveCoverImage(formData)
  const slug = `${slugify(title) || "post"}-${Date.now()}`
  const excerpt = normalizeExcerpt(formData.get("excerpt"))
  const category = resolveCategory(formData.get("category"))
  const tags = parseTags(formData.get("tags"))
  const scheduledAt = parseScheduledAt(formData.get("scheduledAt"))

  const blog = await db.blog.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      imageUrl,
      category,
      tags,
      status,
      scheduledAt,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      authorId: user.id,
    },
  })

  revalidateBlogPaths(slug)
  return { id: blog.id, slug: blog.slug, status: blog.status }
}

export async function updateBlog(id, formData) {
  const user = await requireAdmin()

  const title = String(formData.get("title") ?? "").trim()
  const rawContent = String(formData.get("content") ?? "")
  const status = resolveStatus(formData.get("status"))

  if (!title) {
    throw new Error("A title is required.")
  }

  if (status === "PUBLISHED" && !hasTextContent(rawContent)) {
    throw new Error("Add some content before publishing.")
  }

  const existing = await db.blog.findUnique({
    where: { id },
    select: { publishedAt: true, slug: true },
  })

  if (!existing) {
    throw new Error("Blog post not found.")
  }

  const content = sanitizeContentHtml(rawContent)
  const imageUrl = await resolveCoverImage(formData)
  const excerpt = normalizeExcerpt(formData.get("excerpt"))
  const category = resolveCategory(formData.get("category"))
  const tags = parseTags(formData.get("tags"))
  const scheduledAt = parseScheduledAt(formData.get("scheduledAt"))

  const blog = await db.blog.update({
    where: { id },
    data: {
      title,
      content,
      excerpt,
      imageUrl,
      category,
      tags,
      status,
      scheduledAt,
      publishedAt:
        status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
      ...(status === "PUBLISHED"
        ? { reviewedAt: new Date(), reviewedById: user.id }
        : {}),
    },
  })

  revalidateBlogPaths(blog.slug)
  return { id: blog.id, slug: blog.slug, status: blog.status }
}

export async function setBlogStatus(id, status) {
  const user = await requireAdmin()

  const nextStatus = resolveStatus(status)

  const existing = await db.blog.findUnique({
    where: { id },
    select: { publishedAt: true, slug: true, scheduledAt: true },
  })

  if (!existing) {
    return { message: "Blog post not found." }
  }

  try {
    await db.blog.update({
      where: { id },
      data: {
        status: nextStatus,
        publishedAt:
          nextStatus === "PUBLISHED"
            ? existing.publishedAt ?? new Date()
            : existing.publishedAt,
        scheduledAt:
          nextStatus === "PUBLISHED" ? null : existing.scheduledAt,
        ...(nextStatus === "PUBLISHED"
          ? { reviewedAt: new Date(), reviewedById: user.id }
          : {}),
      },
    })

    revalidateBlogPaths(existing.slug)
    return {
      message:
        nextStatus === "PUBLISHED" ? "Blog published." : "Blog moved to drafts.",
    }
  } catch (error) {
    console.error(error)
    return { message: "Failed to update blog status." }
  }
}

export async function deleteBlog(id) {
  await requireAdmin()

  const blog = await db.blog.delete({
    where: { id },
    select: { slug: true },
  })

  revalidatePath("/admin/blogs")
  revalidatePath("/")
  revalidatePath("/blogs")
  revalidatePath(`/blogs/${blog.slug}`)
  revalidateTag(CACHE_TAGS.blogs, "max")
}

export async function addComment(blogId, formData) {
  const user = await requireUser()

  const content = String(formData.get("content") ?? "").trim()

  if (!content) {
    throw new Error("Comment cannot be empty.")
  }

  if (content.length > 2000) {
    throw new Error("Comment is too long.")
  }

  const limit = checkRateLimit(`comment:${user.id}`, {
    limit: 12,
    windowMs: 10 * 60 * 1000,
  })

  if (!limit.allowed) {
    throw new Error("Too many comments. Please try again later.")
  }

  const blog = await db.blog.findUnique({
    where: { id: blogId },
    select: { status: true },
  })

  if (!blog || blog.status !== "PUBLISHED") {
    throw new Error("This article is not available for comments.")
  }

  await db.comment.create({
    data: {
      content,
      blogId,
      userId: user.id,
    },
  })

  revalidatePath("/blogs")
  revalidateTag(CACHE_TAGS.blogs, "max")
}

export async function deleteComment(commentId) {
  const user = await requireUser()

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, blogId: true },
  })

  if (!comment) throw new Error("Comment not found")

  if (user.role !== "ADMIN" && comment.userId !== user.id) {
    throw new Error("Unauthorized")
  }

  await db.comment.delete({
    where: { id: commentId },
  })

  revalidatePath("/admin/comments")
  revalidatePath("/blogs")
  revalidateTag(CACHE_TAGS.blogs, "max")
}
