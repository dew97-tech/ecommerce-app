import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { DeleteEntityButton } from "@/components/admin/delete-entity-button"
import { EmptyState } from "@/components/admin/empty-state"
import { StatCard } from "@/components/admin/stat-card"
import { UserAvatar } from "@/components/common/user-avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteComment } from "@/lib/actions/blog"
import { db } from "@/lib/db"
import { formatAdminDate, formatAdminDateTime } from "@/lib/format"
import { MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export default async function AdminCommentsPage(props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const currentPage = Math.max(1, Number(searchParams?.page) || 1)
  const limit = 12
  const skip = (currentPage - 1) * limit

  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(now.getDate() - 14)

  const where = query
    ? {
        OR: [
          { content: { contains: query } },
          { user: { name: { contains: query } } },
          { blog: { title: { contains: query } } },
        ],
      }
    : {}

  const [comments, totalCount, totalComments, comments7, commentsPrev7] =
    await Promise.all([
      db.comment.findMany({
        where,
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { name: true, image: true } },
          blog: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.comment.count({ where }),
      db.comment.count(),
      db.comment.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.comment.count({
        where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      }),
    ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Comments"
        description="Moderate reader comments on blog posts."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total comments"
          value={totalComments.toLocaleString("en-US")}
          icon={MessageSquare}
          tone="default"
        />
        <StatCard
          label="New (7 days)"
          value={comments7.toLocaleString("en-US")}
          icon={TrendingUp}
          tone="success"
          trend={percentChange(comments7, commentsPrev7)}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex justify-end border-b border-border p-4">
          <AdminSearch placeholder="Search comments..." />
        </div>

        {comments.length === 0 ? (
          <div className="p-6">
            {totalComments === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No comments yet"
                description="Blog comments will appear here for moderation."
              />
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No comments match your search"
                description="Try a different search term."
              />
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Author</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Blog post</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={comment.user?.name}
                        image={comment.user?.image}
                        className="h-8 w-8"
                      />
                      <span className="max-w-[160px] truncate font-medium text-foreground">
                        {comment.user?.name || "Reader"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[420px] whitespace-normal">
                      <p
                        className="line-clamp-2 text-muted-foreground"
                        title={comment.content}
                      >
                        {comment.content}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/blogs/${comment.blog.slug}`}
                      className="block max-w-[260px] truncate text-primary hover:underline"
                      title={comment.blog.title}
                    >
                      {comment.blog.title}
                    </Link>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    <span title={formatAdminDateTime(comment.createdAt)}>
                      {formatAdminDate(comment.createdAt)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <DeleteEntityButton
                      id={comment.id}
                      itemName={`comment by ${comment.user?.name || "reader"}`}
                      label="Comment"
                      title="Delete comment?"
                      description="This comment will be permanently removed from the blog post."
                      action={deleteComment}
                    />
                  </TableCell>
                </TableRow>
              ))}
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
