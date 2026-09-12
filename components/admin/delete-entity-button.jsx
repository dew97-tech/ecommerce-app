"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

export function DeleteEntityButton({
  id,
  itemName,
  label = "Item",
  title,
  description,
  action,
}) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await action(id)
      toast.success(`${label} deleted.`)
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error?.message || `Failed to delete ${label.toLowerCase()}.`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        disabled={isDeleting}
        aria-label={`Delete ${itemName}`}
        title={`Delete ${itemName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
        title={title || `Delete ${label.toLowerCase()}?`}
        description={
          description || `"${itemName}" will be permanently removed.`
        }
      />
    </>
  )
}
