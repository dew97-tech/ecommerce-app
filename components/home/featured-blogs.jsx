import { Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function FeaturedBlogs({ blogs = [] }) {
  if (blogs.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            From the blog
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guides and news from our team
          </p>
        </div>
        <Link
          href="/blogs"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group">
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
              <div className="relative aspect-video overflow-hidden bg-muted">
                <Image
                  src={blog.imageUrl || "/placeholder.png"}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {blog.author?.name || "Admin"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>

                <h3 className="mt-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                  {blog.title}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {String(blog.content).replace(/<[^>]*>/g, "").slice(0, 150)}…
                </p>

                <span className="mt-4 text-sm font-medium text-primary">
                  Read article →
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
