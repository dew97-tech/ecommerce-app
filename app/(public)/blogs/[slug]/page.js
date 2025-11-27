import { CommentSection } from "@/components/blog/comment-section"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db"
import { Calendar, User } from "lucide-react"
import { notFound } from "next/navigation"

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  
  const blog = await db.blog.findUnique({
    where: { slug },
    include: {
      author: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!blog) notFound()

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <article className="mb-12">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{blog.author.name}</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-center">
            {blog.title}
          </h1>
        </div>

        {blog.imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-xl mb-10 shadow-lg">
            <img 
              src={blog.imageUrl} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MarkdownRenderer content={blog.content} />
        </div>
      </article>

      <Separator className="my-12" />

      <CommentSection blogId={blog.id} comments={blog.comments} />
    </div>
  )
}
