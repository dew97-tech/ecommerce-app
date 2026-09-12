"use client"

import { DeleteEntityButton } from "@/components/admin/delete-entity-button"
import { EmptyState } from "@/components/admin/empty-state"
import { StatCard } from "@/components/admin/stat-card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteBlog, setBlogStatus } from "@/lib/actions/blog"
import { generateContentReports, publishDueContent } from "@/lib/actions/content"
import { BLOG_CATEGORIES } from "@/lib/content/blog-config"
import { cn } from "@/lib/utils"
import {
  CalendarClock,
  Edit,
  Eye,
  FileText,
  Layers,
  RefreshCw,
  Send,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Drafts" },
  { value: "PUBLISHED", label: "Published" },
]

function filterHref(status, category) {
  const params = new URLSearchParams()
  if (status) params.set("status", status)
  if (category) params.set("category", category)
  const query = params.toString()
  return query ? `/admin/content?${query}` : "/admin/content"
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function ContentStudio({
  blogs,
  stats,
  statusFilter,
  categoryFilter,
}) {
  const router = useRouter()
  const [isGenerating, startGenerating] = useTransition()
  const [isPublishing, startPublishing] = useTransition()
  const [isUpdating, startUpdating] = useTransition()

  const handleGenerate = () => {
    startGenerating(async () => {
      try {
        const result = await generateContentReports({ useGemini: true })
        toast.success(result.message)
        router.refresh()
      } catch (error) {
        toast.error(error?.message || "Failed to generate reports.")
      }
    })
  }

  const handlePublishDue = () => {
    startPublishing(async () => {
      try {
        const result = await publishDueContent()
        toast.success(result.message)
        router.refresh()
      } catch (error) {
        toast.error(error?.message || "Failed to publish scheduled posts.")
      }
    })
  }

  const handleToggle = (blog) => {
    const nextStatus = blog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
    startUpdating(async () => {
      try {
        const result = await setBlogStatus(blog.id, nextStatus)
        toast.success(result?.message || "Blog status updated.")
        router.refresh()
      } catch (error) {
        toast.error(error?.message || "Failed to update status.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total posts"
          value={stats.total}
          icon={FileText}
          tone="default"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          icon={Edit}
          tone="warning"
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={Send}
          tone="success"
        />
        <StatCard
          label="Generated"
          value={stats.generated}
          icon={Layers}
          tone="default"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-4">
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          disabled={isGenerating}
          onClick={handleGenerate}
        >
          <RefreshCw
            className={cn("h-4 w-4", isGenerating && "animate-spin")}
          />
          {isGenerating ? "Generating…" : "Generate weekly reports"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={isPublishing}
          onClick={handlePublishDue}
        >
          <CalendarClock className="h-4 w-4" />
          {isPublishing ? "Publishing…" : "Publish due"}
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/admin/blogs/create">
            <FileText className="h-4 w-4" />
            Write manually
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value || "all"}
            href={filterHref(filter.value, categoryFilter)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === filter.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {filter.label}
          </Link>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        {BLOG_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={filterHref(statusFilter, categoryFilter === category ? "" : category)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              categoryFilter === category
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {category}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card">
        {blogs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileText}
              title="No posts match these filters"
              description="Generate weekly price reports or write an article manually."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Article</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => {
                const isPublished = blog.status === "PUBLISHED"
                const isScheduled = !isPublished && Boolean(blog.scheduledAt)

                return (
                  <TableRow key={blog.id} className="hover:bg-muted/40">
                    <TableCell className="max-w-[340px]">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{blog.title}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          /blogs/{blog.slug}
                        </span>
                        {blog.tags.length > 0 && (
                          <span className="mt-1 truncate text-xs text-muted-foreground">
                            {blog.tags.join(" · ")}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {blog.category || "—"}
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                          isPublished
                            ? "border-success/30 bg-success/10 text-success"
                            : isScheduled
                              ? "border-warning/30 bg-warning/10 text-warning"
                              : "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {isPublished
                          ? "Published"
                          : isScheduled
                            ? "Scheduled"
                            : "Draft"}
                      </span>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {blog.generatedBy ? "Generated" : "Manual"}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {isScheduled
                        ? formatDate(blog.scheduledAt)
                        : formatDate(blog.publishedAt ?? blog.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-primary"
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
                          className="h-8 w-8 hover:text-primary"
                        >
                          <Link
                            href={`/admin/blogs/${blog.id}`}
                            aria-label={`Edit ${blog.title}`}
                            title={`Edit ${blog.title}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleToggle(blog)}
                        >
                          {isPublished ? "Unpublish" : "Publish"}
                        </Button>
                        <DeleteEntityButton
                          id={blog.id}
                          itemName={blog.title}
                          label="Post"
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
      </div>
    </div>
  )
}
