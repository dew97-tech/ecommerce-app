'use client'

import { ImageField } from '@/components/admin/image-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBanner } from '@/lib/actions/admin-banners'
import { useActionState } from 'react'

export function BannerForm({ routes = [] }) {
  const [state, dispatch, isPending] = useActionState(createBanner, { message: null })

  return (
    <form action={dispatch} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="banner-title">Title</Label>
          <Input id="banner-title" name="title" placeholder="Build Your Dream PC" className="min-w-0" />
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="banner-buttonText">Button text</Label>
          <Input id="banner-buttonText" name="buttonText" placeholder="Shop Now" className="min-w-0" />
        </div>
      </div>

      <ImageField
        label="Desktop image"
        urlName="imageUrl"
        fileName="imageFile"
        required
        description="Shown on tablets and desktops. Recommended 1920×640."
      />

      <ImageField
        label="Mobile image (optional)"
        urlName="imageMobileUrl"
        fileName="imageMobileFile"
        description="Portrait image for phones. Falls back to the desktop image when empty."
      />

      <div className="min-w-0 space-y-1.5">
        <Label htmlFor="banner-link">Link</Label>
        <Select name="link">
          <SelectTrigger id="banner-link" className="w-full">
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

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add banner'}
        </Button>
        {state.message && (
          <p
            className={
              state.message.includes('success')
                ? 'text-sm text-success'
                : 'text-sm text-destructive'
            }
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
