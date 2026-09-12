import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { unstable_cache } from "next/cache"
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config"
import { BLOG_CATEGORIES } from "@/lib/content/blog-config"
import { getPopularBlogTags, readingTimeMinutes } from "@/lib/content/blogs"
import { db } from "@/lib/db"
import { stripHtmlContent } from "@/lib/sanitize"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const loadPublishedBlogs = unstable_cache(
  async (search, category, tag) => {
    const where = { status: "PUBLISHED" }
    if (search) {
      where.title = { contains: search }
    }
    if (category) {
      where.category = category
    }
    if (tag) {
      where.tags = { array_contains: tag }
    }

    return db.blog.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
    })
  },
  ["published-blogs"],
  {
    tags: [CACHE_TAGS.blogs],
    revalidate: staggeredTtl(CACHE_TTL.blog),
  }
)

function filterHref(current, updates = {}) {
  const next = { ...current, ...updates }
  const params = new URLSearchParams()
  if (next.search) params.set("search", next.search)
  if (next.category) params.set("category", next.category)
  if (next.tag) params.set("tag", next.tag)
  const query = params.toString()
  return query ? `/blogs?${query}` : "/blogs"
}

export default async function BlogsPage({ searchParams }) {
  const resolved = await searchParams
  const search = typeof resolved.search === "string" ? resolved.search : ""
  const category = typeof resolved.category === "string" ? resolved.category : ""
  const tag = typeof resolved.tag === "string" ? resolved.tag : ""
  const current = { search, category, tag }

  const [blogs, popularTags] = await Promise.all([
    loadPublishedBlogs(search, category, tag),
    getPopularBlogTags(),
  ])

  const chipBase =
    "rounded-full border px-3 py-1 text-xs font-medium transition-colors"
  const chipIdle = "border-border text-muted-foreground hover:bg-muted"
  const chipActive = "border-primary bg-primary/10 text-primary"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold">Our Blog</h1>

        <form className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search articles..."
            className="pl-10"
            defaultValue={search}
          />
          {category && <input type="hidden" name="category" value={category} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
        </form>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Link
          href={filterHref(current, { category: "", tag: "" })}
          className={cn(
            chipBase,
            !category && !tag ? chipActive : chipIdle
          )}
        >
          All
        </Link>
        {BLOG_CATEGORIES.map((entry) => (
          <Link
            key={entry}
            href={filterHref(current, {
              category: category === entry ? "" : entry,
            })}
            className={cn(
              chipBase,
              category === entry ? chipActive : chipIdle
            )}
          >
            {entry}
          </Link>
        ))}
        {popularTags.length > 0 && (
          <span className="mx-1 hidden h-4 w-px bg-border sm:block" />
        )}
        {popularTags.map((entry) => (
          <Link
            key={entry.tag}
            href={filterHref(current, { tag: tag === entry.tag ? "" : entry.tag })}
            className={cn(chipBase, tag === entry.tag ? chipActive : chipIdle)}
          >
            #{entry.tag}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              {blog.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  {blog.category && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {blog.category}
                    </span>
                  )}
                  <span>
                    {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString(
                      "en-US"
                    )}{" "}
                    • {blog.author.name} • {readingTimeMinutes(blog.content)} min read
                  </span>
                </div>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {blog.excerpt || stripHtmlContent(blog.content)}
                </p>
                <Button
                  variant="link"
                  className="px-0 mt-4 group-hover:translate-x-1 transition-transform"
                >
                  Read More &rarr;
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}

        {blogs.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">No articles found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
