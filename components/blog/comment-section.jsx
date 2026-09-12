"use client"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addComment, deleteComment } from "@/lib/actions/blog"
import { Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

export function CommentSection({ blogId, comments }) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData) {
    if (!session) {
      toast.error("Please login to comment")
      return
    }

    setIsSubmitting(true)
    try {
      await addComment(blogId, formData)
      toast.success("Comment added!")

      document.getElementById("comment-form").reset()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(commentId) {
    if (!confirm("Are you sure?")) return
    try {
      await deleteComment(commentId)
      toast.success("Comment deleted")
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold">Comments ({comments.length})</h3>

      {session ? (
        <form id="comment-form" action={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <UserAvatar
              name={session.user.name}
              image={session.user.image}
              className="h-9 w-9"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <Textarea
                name="content"
                placeholder="Share your thoughts..."
                required
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-border bg-muted/40 p-6 text-center">
          <p className="mb-4 text-muted-foreground">
            Please log in to join the discussion.
          </p>
          <Button variant="outline" asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="group flex gap-3">
            <UserAvatar
              name={comment.user.name}
              image={comment.user.image}
              className="h-9 w-9"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {comment.user.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>
                {(session?.user?.role === "ADMIN" ||
                  session?.user?.id === comment.userId) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
