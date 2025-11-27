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
import { Edit, Plus, Trash2 } from "lucide-react"
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Blogs</h1>
        <Link href="/admin/blogs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Blog
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell>{blog.author.name}</TableCell>
                <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/blogs/${blog.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <form action={deleteBlog.bind(null, blog.id)}>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {blogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No blogs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
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
      )}
    </div>
  )
}
