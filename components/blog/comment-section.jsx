"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
      // Reset form manually or rely on key change if needed, but simple reset is fine
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
          <div className="flex gap-4">
            <Avatar>
              <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
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
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <p className="text-muted-foreground mb-4">Please log in to join the discussion.</p>
          <Button variant="outline" asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <Avatar>
              <AvatarFallback>{comment.user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {(session?.user?.role === "ADMIN" || session?.user?.id === comment.userId) && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
