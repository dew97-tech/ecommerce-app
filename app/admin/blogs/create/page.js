'use client'

import { MarkdownEditor } from "@/components/markdown-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBlog } from "@/lib/actions/blog"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function CreateBlogPage() {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData) {
    setIsSubmitting(true)
    try {
      formData.set('content', content)
      await createBlog(formData)
      toast.success("Blog published successfully!")
      router.push('/admin/blogs')
    } catch (error) {
      toast.error(error.message || "Failed to create blog")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin/blogs" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">Create New Blog Post</h1>
      
      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Enter blog title" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Cover Image URL</Label>
          <Input id="imageUrl" name="imageUrl" placeholder="https://..." />
          <p className="text-xs text-muted-foreground">Provide a URL for the blog cover image.</p>
        </div>

        <div className="space-y-2">
          <Label>Content (Markdown)</Label>
          <MarkdownEditor 
            value={content}
            onChange={setContent}
            placeholder="Write your blog content in markdown..."
          />
          <p className="text-xs text-muted-foreground">
            Use markdown formatting: **bold**, _italic_, # headings, - lists, etc.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/blogs">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish Blog'}
          </Button>
        </div>
      </form>
    </div>
  )
}
