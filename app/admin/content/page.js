import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ContentStudio } from "@/components/admin/content-studio"
import { BLOG_CATEGORIES } from "@/lib/content/blog-config"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function AdminContentPage(props) {
  const searchParams = await props.searchParams
  const statusFilter = ["PUBLISHED", "DRAFT"].includes(searchParams?.status)
    ? searchParams.status
    : ""
  const categoryFilter = BLOG_CATEGORIES.includes(searchParams?.category)
    ? searchParams.category
    : ""

  const where = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(categoryFilter ? { category: categoryFilter } : {}),
  }

  const [blogs, total, drafts, published, generated] = await Promise.all([
    db.blog.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        category: true,
        tags: true,
        generatedBy: true,
        scheduledAt: true,
        createdAt: true,
        publishedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    db.blog.count(),
    db.blog.count({ where: { status: "DRAFT" } }),
    db.blog.count({ where: { status: "PUBLISHED" } }),
    db.blog.count({ where: { generatedBy: { not: null } } }),
  ])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Content Studio"
        description="Generate, review and schedule price-watch articles and guides."
      />

      <ContentStudio
        blogs={blogs.map((blog) => ({
          ...blog,
          tags: Array.isArray(blog.tags) ? blog.tags : [],
        }))}
        stats={{ total, drafts, published, generated }}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
      />
    </div>
  )
}
