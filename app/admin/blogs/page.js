import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { deleteBlog } from "@/lib/actions/blog"
import { db } from "@/lib/db"
import { Edit, FileText, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default async function AdminBlogsPage({ searchParams }) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 10
  const skip = (currentPage - 1) * limit

  const [blogs, totalCount] = await Promise.all([
    db.blog.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.blog.count(),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="p-8 pt-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Manage Blogs</h2>
          <p className="text-muted-foreground mt-1">Create and manage blog posts</p>
        </div>
        <Link href="/admin/blogs/create">
          <Button size="lg" className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" /> Create Blog
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Author</TableHead>
              <TableHead className="font-semibold">Created At</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No blogs found. Create your first blog post!</p>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{blog.author.name}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/blogs/${blog.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteBlog.bind(null, blog.id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={`?page=${Math.max(1, currentPage - 1)}`}
                  aria-disabled={currentPage <= 1}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href={`?page=${i + 1}`} 
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                  aria-disabled={currentPage >= totalPages}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
