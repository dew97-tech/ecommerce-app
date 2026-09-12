import { auth } from "@/auth"
import { BlogShare } from "@/components/blog/blog-share"
import { CommentSection } from "@/components/blog/comment-section"
import { RelatedPosts } from "@/components/blog/related-posts"
import { ContentRenderer } from "@/components/common/content-renderer"
import { JsonLd } from "@/components/seo/json-ld"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db"
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config"
import { readingTimeMinutes } from "@/lib/content/blogs"
import { stripHtmlContent } from "@/lib/sanitize"
import { articleSchema, breadcrumbSchema } from "@/lib/seo/structured-data"
import { Calendar, Eye, Pencil, User } from "lucide-react"
import { unstable_cache } from "next/cache"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"

const loadBlog = unstable_cache(
  async (slug) =>
    db.blog.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, image: true } },
        comments: {
          take: 50,
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true,
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ["blog-detail"],
  {
    tags: [CACHE_TAGS.blogs],
    revalidate: staggeredTtl(CACHE_TTL.blog),
  }
)

const getBlog = cache(loadBlog)

async function getViewerIsAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const blog = await getBlog(slug)

  if (!blog) {
    return { title: "Article not found", robots: { index: false, follow: false } }
  }

  const description = (blog.excerpt || stripHtmlContent(blog.content))
    .replace(/[#*_>`]/g, "")
    .slice(0, 160)

  const isDraft = blog.status !== "PUBLISHED"

  return {
    title: blog.title,
    description,
    alternates: isDraft ? undefined : { canonical: `/blogs/${blog.slug}` },
    robots: isDraft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: blog.title,
      description,
      url: `/blogs/${blog.slug}`,
      images: blog.imageUrl ? [blog.imageUrl] : undefined,
      publishedTime: new Date(blog.publishedAt ?? blog.createdAt).toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: blog.imageUrl ? [blog.imageUrl] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params

  const blog = await getBlog(slug)

  if (!blog) notFound()

  const isDraft = blog.status !== "PUBLISHED"

  if (isDraft) {
    const isAdmin = await getViewerIsAdmin()
    if (!isAdmin) notFound()
  }

  const publishedAt = blog.publishedAt ?? blog.createdAt

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <JsonLd data={articleSchema(blog)} />
      {!isDraft && (
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
            { name: blog.title, path: `/blogs/${blog.slug}` },
          ])}
        />
      )}

      {isDraft && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <Eye className="h-4 w-4 shrink-0" />
            <span className="font-medium">Draft preview</span>
            <span className="text-muted-foreground">
              — only admins can see this page
            </span>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href={`/admin/blogs/${blog.id}`}>
              <Pencil className="h-3.5 w-3.5" />
              Edit post
            </Link>
          </Button>
        </div>
      )}

      <article className="mb-12">
        <div className="mb-8 space-y-4">
          {isDraft && (
            <div className="flex justify-center">
              <Badge variant="secondary">Draft</Badge>
            </div>
          )}
          <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(publishedAt).toLocaleDateString("en-US")}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{blog.author.name}</span>
            </div>
            <span>•</span>
            <span>{readingTimeMinutes(blog.content)} min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-center">
            {blog.title}
          </h1>
        </div>

        {blog.imageUrl && (
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-xl shadow-lg">
            <Image
              src={blog.imageUrl}
              alt={blog.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <ContentRenderer content={blog.content} />
      </article>

      <div className="mb-12 flex justify-end">
        <BlogShare title={blog.title} />
      </div>

      <RelatedPosts blogId={blog.id} category={blog.category} />

      <Separator className="my-12" />

      {!isDraft && (
        <CommentSection blogId={blog.id} comments={blog.comments} />
      )}
    </div>
  )
}
