import { EditBlogForm } from "@/components/admin/edit-blog-form"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export default async function EditBlogPage({ params }) {
  const { id } = await params
  const blog = await db.blog.findUnique({
    where: { id },
  })

  if (!blog) notFound()

  return <EditBlogForm blog={blog} />
}
