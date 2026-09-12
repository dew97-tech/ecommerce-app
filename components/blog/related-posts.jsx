import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRelatedBlogs, readingTimeMinutes } from "@/lib/content/blogs"
import { stripHtmlContent } from "@/lib/sanitize"
import Image from "next/image"
import Link from "next/link"

export async function RelatedPosts({ blogId, category }) {
  const blogs = await getRelatedBlogs(blogId, category ?? "")
  if (blogs.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-2xl font-bold text-foreground">
        Related articles
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
              {blog.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2 text-base group-hover:text-primary transition-colors">
                  {blog.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {blog.excerpt || stripHtmlContent(blog.content)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {readingTimeMinutes(blog.content)} min read
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
