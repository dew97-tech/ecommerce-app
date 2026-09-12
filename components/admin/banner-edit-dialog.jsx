'use client'

import { ImageField } from '@/components/admin/image-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateBanner } from '@/lib/actions/admin-banners'
import { Edit } from 'lucide-react'
import { useActionState, useState } from 'react'

export function BannerEditDialog({ banner, routes = [] }) {
  const [state, dispatch, isPending] = useActionState(updateBanner, { message: null })
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl">
        <form action={dispatch} className="flex max-h-[90vh] min-h-0 flex-col">
          <div className="border-b border-border px-6 py-4">
            <DialogHeader>
              <DialogTitle>Edit banner</DialogTitle>
              <DialogDescription>
                Update the artwork, copy and destination link.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <input type="hidden" name="id" value={banner.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor={`banner-title-${banner.id}`}>Title</Label>
                <Input
                  id={`banner-title-${banner.id}`}
                  name="title"
                  defaultValue={banner.title ?? ''}
                  className="min-w-0"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <Label htmlFor={`banner-button-${banner.id}`}>Button text</Label>
                <Input
                  id={`banner-button-${banner.id}`}
                  name="buttonText"
                  defaultValue={banner.buttonText ?? ''}
                  className="min-w-0"
                />
              </div>
            </div>

            <ImageField
              label="Desktop image"
              urlName="imageUrl"
              fileName="imageFile"
              currentUrl={banner.image}
              description="Leave the URL as-is or upload a replacement."
            />

            <ImageField
              label="Mobile image (optional)"
              urlName="imageMobileUrl"
              fileName="imageMobileFile"
              currentUrl={banner.imageMobile}
              description="Used on phones. Leave empty to keep the current mobile image."
            />

            <div className="min-w-0 space-y-1.5">
              <Label htmlFor={`banner-link-${banner.id}`}>Link</Label>
              <Select name="link" defaultValue={banner.link ?? undefined}>
                <SelectTrigger id={`banner-link-${banner.id}`} className="w-full">
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {routes.map((route) => (
                    <SelectItem key={route.path} value={route.path}>
                      {route.name} ({route.path})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <p
              className={
                state.message
                  ? state.message.includes('success')
                    ? 'text-sm text-success'
                    : 'text-sm text-destructive'
                  : 'text-xs text-muted-foreground'
              }
            >
              {state.message || 'Changes apply to the homepage hero immediately.'}
            </p>

            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
