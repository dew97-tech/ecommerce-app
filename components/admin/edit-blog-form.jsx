'use client'

import { MarkdownEditor } from "@/components/markdown-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateBlog } from "@/lib/actions/blog"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function EditBlogForm({ blog }) {
  const [content, setContent] = useState(blog.content || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData) {
    setIsSubmitting(true)
    try {
      formData.set('content', content)
      await updateBlog(blog.id, formData)
      toast.success("Blog updated successfully!")
      router.push('/admin/blogs')
    } catch (error) {
      toast.error(error.message || "Failed to update blog")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin/blogs" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
      
      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            name="title" 
            required 
            defaultValue={blog.title} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Cover Image URL</Label>
          <Input 
            id="image" 
            name="image" 
            defaultValue={blog.imageUrl} 
          />
        </div>

        <div className="space-y-2">
          <Label>Content (Markdown)</Label>
          <MarkdownEditor 
            value={content}
            onChange={setContent}
            placeholder="Write your blog content in markdown..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/blogs">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Blog'}
          </Button>
        </div>
      </form>
    </div>
  )
}
