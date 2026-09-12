import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { BlogStatusToggle } from "@/components/admin/blog-status-toggle"
import { DeleteEntityButton } from "@/components/admin/delete-entity-button"
import { EmptyState } from "@/components/admin/empty-state"
import { StatCard } from "@/components/admin/stat-card"
import { UserAvatar } from "@/components/common/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteBlog } from "@/lib/actions/blog"
import { db } from "@/lib/db"
import { formatAdminDate, formatAdminDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { CircleCheck, Clock, Edit, Eye, FileText, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Drafts" },
]

function buildFilterHref(value, searchParams) {
  const params = new URLSearchParams(searchParams)
  params.set('page', '1')

  if (value) {
    params.set('status', value)
  } else {
    params.delete('status')
  }

  return `/admin/blogs?${params.toString()}`
}

export default async function AdminBlogsPage(props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const currentPage = Math.max(1, Number(searchParams?.page) || 1)
  const statusFilter = ["PUBLISHED", "DRAFT"].includes(searchParams?.status)
    ? searchParams.status
    : ""
  const limit = 12
  const skip = (currentPage - 1) * limit

  const and = []

  if (statusFilter) {
    and.push({ status: statusFilter })
  }

  if (query) {
    and.push({
      OR: [
        { title: { contains: query } },
        { slug: { contains: query } },
      ],
    })
  }

  const where = and.length > 0 ? { AND: and } : {}

  const [
    blogs,
    totalCount,
    totalBlogs,
    publishedCount,
    draftCount,
  ] = await Promise.all([
    db.blog.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        publishedAt: true,
        author: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.blog.count({ where }),
    db.blog.count(),
    db.blog.count({ where: { status: "PUBLISHED" } }),
    db.blog.count({ where: { status: "DRAFT" } }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Blogs"
        description="Publish buying guides and news articles."
        actions={
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/admin/blogs/create">
              <Plus className="h-4 w-4" />
              Create blog
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total posts"
          value={totalBlogs.toLocaleString("en-US")}
          icon={FileText}
          tone="default"
        />
        <StatCard
          label="Published"
          value={publishedCount.toLocaleString("en-US")}
          icon={CircleCheck}
          tone="success"
        />
        <StatCard
          label="Drafts"
          value={draftCount.toLocaleString("en-US")}
          icon={Clock}
          tone="warning"
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1">
            {STATUS_FILTERS.map((filter) => (
              <Link
                key={filter.value || 'all'}
                href={buildFilterHref(filter.value, searchParams)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  statusFilter === filter.value
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          <AdminSearch placeholder="Search blogs..." />
        </div>

        {blogs.length === 0 ? (
          <div className="p-6">
            {totalBlogs === 0 ? (
              <EmptyState
                icon={FileText}
                title="No blog posts yet"
                description="Create your first article to fill the homepage blog section."
                action={
                  <Button asChild size="sm" className="gap-1.5">
                    <Link href="/admin/blogs/create">
                      <Plus className="h-4 w-4" />
                      Create blog
                    </Link>
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={FileText}
                title="No blog posts match your filters"
                description="Try a different search term or status filter."
              />
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => {
                const isPublished = blog.status === "PUBLISHED"
                const displayDate = blog.publishedAt ?? blog.createdAt

                return (
                  <TableRow key={blog.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
                          {blog.imageUrl ? (
                            <Image
                              src={blog.imageUrl}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <FileText className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span
                            className="max-w-[320px] truncate font-medium text-foreground"
                            title={blog.title}
                          >
                            {blog.title}
                          </span>
                          <span className="max-w-[320px] truncate text-xs text-muted-foreground">
                            /blogs/{blog.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={blog.author?.name}
                          image={blog.author?.image}
                          className="h-8 w-8"
                        />
                        <span className="max-w-[160px] truncate text-foreground">
                          {blog.author?.name || "Admin"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BlogStatusToggle
                          id={blog.id}
                          status={blog.status}
                          title={blog.title}
                        />
                        <Badge variant={isPublished ? "success" : "secondary"}>
                          {isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      <span title={formatAdminDateTime(displayDate)}>
                        {formatAdminDate(displayDate)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Link
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            aria-label={`Preview ${blog.title}`}
                            title={`Preview ${blog.title}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Link
                            href={`/admin/blogs/${blog.id}`}
                            aria-label={`Edit ${blog.title}`}
                            title={`Edit ${blog.title}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteEntityButton
                          id={blog.id}
                          itemName={blog.title}
                          label="Blog post"
                          title="Delete blog post?"
                          description={`"${blog.title}" will be permanently removed.`}
                          action={deleteBlog}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        <div className="border-t border-border p-4">
          <AdminPagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}
