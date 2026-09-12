'use client'

import { Button } from '@/components/ui/button'
import { deleteBanner } from '@/lib/actions/admin-banners'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'

export function BannerDeleteButton({ bannerId, bannerTitle }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteBanner(bannerId)
      if (result?.message?.toLowerCase().includes('deleted')) {
        toast.success(result.message)
        setOpen(false)
      } else {
        toast.error(result?.message || 'Failed to delete banner')
      }
    } catch (error) {
      toast.error('Failed to delete banner')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        disabled={isDeleting}
        aria-label={`Delete ${bannerTitle || 'banner'}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
        title="Delete banner?"
        description={`"${bannerTitle || 'This banner'}" will be removed from the homepage.`}
      />
    </>
  )
}
