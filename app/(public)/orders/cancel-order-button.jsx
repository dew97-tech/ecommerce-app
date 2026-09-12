'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cancelOrder } from "@/lib/actions/order"
import { Loader2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const REASONS = [
  "Changed my mind",
  "Found a better price",
  "Ordered by mistake",
  "Delivery taking too long",
  "Payment issue",
  "Other",
]

export function CancelOrderButton({ orderId }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")

  const handleCancel = async () => {
    if (!reason) {
      toast.error("Please choose a reason for cancelling")
      return
    }

    if (reason === "Other" && !note.trim()) {
      toast.error("Please add a short note for the reason")
      return
    }

    setLoading(true)

    try {
      await cancelOrder(orderId, { reason, note: note.trim() })
      toast.success("Order cancelled")
      setOpen(false)
      setReason("")
      setNote("")
      router.refresh()
    } catch (error) {
      console.error("Cancel error:", error)
      toast.error(error?.message || "Failed to cancel order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        <XCircle className="h-4 w-4" />
        Cancel order
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!loading) setOpen(next)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Cancel this order?
            </DialogTitle>
            <DialogDescription>
              This releases the reserved stock and cannot be undone. The
              cancellation will be visible to our team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={`cancel-reason-${orderId}`}>
                Why are you cancelling?
              </Label>
              <Select value={reason} onValueChange={setReason} disabled={loading}>
                <SelectTrigger id={`cancel-reason-${orderId}`} className="w-full">
                  <SelectValue placeholder="Choose a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`cancel-note-${orderId}`}>
                Note {reason === "Other" ? "" : "(optional)"}
              </Label>
              <Textarea
                id={`cancel-note-${orderId}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Anything else we should know?"
                maxLength={500}
                disabled={loading}
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Keep order
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
