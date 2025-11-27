import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"
import { Search } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function BlogsPage({ searchParams }) {
  const { search } = await searchParams
  
  const where = {}
  if (search) {
    where.title = { contains: search } // Note: Basic search
  }

  const blogs = await db.blog.findMany({
    where,
    include: { author: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Our Blog</h1>
        
        <form className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            name="search" 
            placeholder="Search articles..." 
            className="pl-10" 
            defaultValue={search}
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              {blog.image && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <div className="text-sm text-muted-foreground mb-2">
                  {new Date(blog.createdAt).toLocaleDateString()} • {blog.author.name}
                </div>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {blog.content}
                </p>
                <Button variant="link" className="px-0 mt-4 group-hover:translate-x-1 transition-transform">
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
