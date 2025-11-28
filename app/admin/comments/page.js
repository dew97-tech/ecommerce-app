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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Manage Comments</h2>
          <p className="text-muted-foreground mt-1">Moderate user comments on blogs</p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Comment</TableHead>
              <TableHead className="font-semibold">Blog Post</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id} className="hover:bg-muted/50 transition-colors">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
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
