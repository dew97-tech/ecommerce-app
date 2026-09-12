'use client'

import { Button } from '@/components/ui/button'
import { deleteProduct } from '@/lib/actions/admin-products'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'

export function ProductDeleteButton({ productId, productName, redirectTo }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteProduct(productId)
      if (result?.message?.toLowerCase().includes('deleted')) {
        toast.success(result.message)
        setOpen(false)
        if (redirectTo) {
          router.push(redirectTo)
          router.refresh()
        }
      } else {
        toast.error(result?.message || 'Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:text-destructive"
        onClick={() => setOpen(true)}
        disabled={isDeleting}
        aria-label={`Delete ${productName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
        title="Delete product?"
        description={`"${productName}" will be permanently removed. Products linked to orders or reviews cannot be deleted — archive them instead.`}
      />
    </>
  )
}
