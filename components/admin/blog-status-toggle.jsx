"use client"

import { Switch } from "@/components/ui/switch"
import { setBlogStatus } from "@/lib/actions/blog"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

export function BlogStatusToggle({ id, status, title }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isPublished = status === "PUBLISHED"

  function handleChange(nextChecked) {
    startTransition(async () => {
      try {
        const result = await setBlogStatus(
          id,
          nextChecked ? "PUBLISHED" : "DRAFT"
        )
        toast.success(result.message || "Status updated.")
        router.refresh()
      } catch (error) {
        toast.error(error.message || "Failed to update status")
      }
    })
  }

  return (
    <Switch
      checked={isPublished}
      onCheckedChange={handleChange}
      disabled={isPending}
      label={`${isPublished ? "Unpublish" : "Publish"} ${title}`}
    />
  )
}
