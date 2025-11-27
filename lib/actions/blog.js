"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- Blog Actions ---

export async function createBlog(formData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const title = formData.get("title")
  const content = formData.get("content")
  const image = formData.get("image")
  
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now()

  await db.blog.create({
    data: {
      title,
      slug,
      content,
      image,
      authorId: session.user.id,
    },
  })

  revalidatePath("/admin/blogs")
  revalidatePath("/blogs")
  redirect("/admin/blogs")
}

export async function updateBlog(id, formData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const title = formData.get("title")
  const content = formData.get("content")
  const image = formData.get("image")

  await db.blog.update({
    where: { id },
    data: {
      title,
      content,
      image,
    },
  })

  revalidatePath("/admin/blogs")
  revalidatePath("/blogs")
  redirect("/admin/blogs")
}

export async function deleteBlog(id) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  await db.blog.delete({
    where: { id },
  })

  revalidatePath("/admin/blogs")
  revalidatePath("/blogs")
}

// --- Comment Actions ---

export async function addComment(blogId, formData) {
  const session = await auth()
  if (!session) {
    throw new Error("You must be logged in to comment")
  }

  const content = formData.get("content")

  await db.comment.create({
    data: {
      content,
      blogId,
      userId: session.user.id,
    },
  })

  revalidatePath(`/blogs`) // Ideally revalidate specific blog page but path depends on slug
}

export async function deleteComment(commentId) {
  const session = await auth()
  // Allow Admin or the comment owner to delete
  if (!session) throw new Error("Unauthorized")

  const comment = await db.comment.findUnique({
    where: { id: commentId },
  })

  if (!comment) throw new Error("Comment not found")

  if (session.user.role !== "ADMIN" && comment.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  await db.comment.delete({
    where: { id: commentId },
  })

  revalidatePath("/admin/comments")
  revalidatePath("/blogs")
}
