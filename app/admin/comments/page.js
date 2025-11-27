import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { deleteComment } from "@/lib/actions/blog"
import { db } from "@/lib/db"
import { Trash2 } from "lucide-react"
import Link from "next/link"

export default async function AdminCommentsPage() {
  const comments = await db.comment.findMany({
    include: { 
      user: true,
      blog: true 
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Comments</h1>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Blog Post</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">{comment.user.name}</TableCell>
                <TableCell className="max-w-md truncate" title={comment.content}>
                  {comment.content}
                </TableCell>
                <TableCell>
                  <Link href={`/blogs/${comment.blog.slug}`} className="text-primary hover:underline">
                    {comment.blog.title}
                  </Link>
                </TableCell>
                <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <form action={deleteComment.bind(null, comment.id)}>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {comments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No comments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
