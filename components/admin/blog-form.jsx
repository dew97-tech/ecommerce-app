"use client"

import { ImageField } from "@/components/admin/image-field"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createBlog, setBlogStatus, updateBlog } from "@/lib/actions/blog"
import { BLOG_CATEGORIES } from "@/lib/content/blog-config"
import { ArrowLeft, Eye, Save, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

function toLocalInput(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function BlogForm({ blog = null }) {
  const isEditing = Boolean(blog)
  const isPublished = blog?.status === "PUBLISHED"

  const [content, setContent] = useState(blog?.content || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData) {
    setIsSubmitting(true)
    try {
      formData.set("content", content)

      if (isEditing) {
        await updateBlog(blog.id, formData)
      } else {
        await createBlog(formData)
      }

      const nextStatus = formData.get("status")
      toast.success(
        nextStatus === "PUBLISHED"
          ? "Blog published successfully."
          : "Draft saved."
      )
      router.push("/admin/blogs")
      router.refresh()
    } catch (error) {
      toast.error(error.message || "Failed to save blog post")
      setIsSubmitting(false)
    }
  }

  async function handleUnpublish() {
    setIsSubmitting(true)
    try {
      const result = await setBlogStatus(blog.id, "DRAFT")
      toast.success(result.message || "Blog moved to drafts.")
      router.push("/admin/blogs")
      router.refresh()
    } catch (error) {
      toast.error(error.message || "Failed to unpublish blog post")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <Link
        href="/admin/blogs"
        className="flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blogs
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
          </h1>
          {isEditing && (
            <Badge variant={isPublished ? "default" : "secondary"}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
          )}
        </div>

        {isEditing && (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/blogs/${blog.slug}`} target="_blank">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Link>
          </Button>
        )}
      </div>

      <form
        action={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-4 md:p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={blog?.title || ""}
            placeholder="Enter blog title"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              maxLength={300}
              defaultValue={blog?.excerpt || ""}
              placeholder="Short summary shown on cards and used as the meta description."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue={blog?.category || "Buying Guide"}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {BLOG_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={(Array.isArray(blog?.tags) ? blog.tags : []).join(", ")}
              placeholder="ram, ddr5, price watch"
            />
            <p className="text-xs text-muted-foreground">
              Comma separated, up to 8 tags.
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="scheduledAt">Schedule publish (optional)</Label>
            <Input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              defaultValue={toLocalInput(blog?.scheduledAt)}
            />
            <p className="text-xs text-muted-foreground">
              Saves as a draft. The publish-due job publishes it once the time
              passes.
            </p>
          </div>
        </div>

        <ImageField
          label="Cover image"
          description="Paste a URL or upload a file (JPEG, PNG, WebP or GIF, up to 5 MB)."
          urlName="imageUrl"
          fileName="imageFile"
          currentUrl={blog?.imageUrl || null}
        />

        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your article..."
          />
          <p className="text-xs text-muted-foreground">
            Use the toolbar to format text, add links, lists and images.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Button asChild type="button" variant="ghost">
            <Link href="/admin/blogs">Cancel</Link>
          </Button>

          {isPublished ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleUnpublish}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              type="submit"
              name="status"
              value="DRAFT"
              variant="outline"
              disabled={isSubmitting}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save draft
            </Button>
          )}

          <Button
            type="submit"
            name="status"
            value="PUBLISHED"
            disabled={isSubmitting}
            className="gap-1.5"
          >
            <Send className="h-4 w-4" />
            {isSubmitting
              ? "Saving..."
              : isPublished
                ? "Update"
                : "Publish"}
          </Button>
        </div>
      </form>
    </div>
  )
}
