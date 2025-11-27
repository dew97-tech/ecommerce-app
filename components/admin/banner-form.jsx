'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBanner } from '@/lib/admin-banner-actions'
import { useActionState, useState } from 'react'

export function BannerForm() {
  const [state, dispatch, isPending] = useActionState(createBanner, { message: null })
  const [mode, setMode] = useState('url') // 'url' or 'file'

  return (
    <div className="space-y-4">
      <Tabs defaultValue="url" onValueChange={setMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="url">Image URL</TabsTrigger>
          <TabsTrigger value="file">Upload Image</TabsTrigger>
        </TabsList>
        
        <form action={dispatch} className="mt-4 space-y-4">
            <input type="hidden" name="mode" value={mode} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="Banner Title" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image-input">Image</Label>
                    <TabsContent value="url" className="mt-0">
                        <Input id="image-url" name="imageUrl" placeholder="https://example.com/image.jpg" required={mode === 'url'} />
                    </TabsContent>
                    <TabsContent value="file" className="mt-0">
                        <Input id="image-file" name="imageFile" type="file" accept="image/*" required={mode === 'file'} />
                    </TabsContent>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link">Link (Optional)</Label>
                    <Input id="link" name="link" placeholder="/products/..." />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Adding...' : 'Add Banner'}
                </Button>
                {state.message && (
                    <p className={`text-sm ${state.message.includes('created') ? 'text-green-600' : 'text-red-500'}`}>
                        {state.message}
                    </p>
                )}
            </div>
        </form>
      </Tabs>
    </div>
  )
}
