'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateBanner } from '@/lib/admin-banner-actions'
import { Edit } from 'lucide-react'
import { useActionState, useState } from 'react'

export function BannerEditDialog({ banner, routes = [] }) {
  const [state, dispatch, isPending] = useActionState(updateBanner, { message: null })
  const [mode, setMode] = useState('url') // 'url' or 'file'
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Banner</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="url" onValueChange={setMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">Image URL</TabsTrigger>
                <TabsTrigger value="file">Upload Image</TabsTrigger>
            </TabsList>
            
            <form action={dispatch} className="mt-4 space-y-4">
                <input type="hidden" name="id" value={banner.id} />
                <input type="hidden" name="mode" value={mode} />
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input id="edit-title" name="title" defaultValue={banner.title} placeholder="Banner Title" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-buttonText">Button Text</Label>
                            <Input id="edit-buttonText" name="buttonText" defaultValue={banner.buttonText} placeholder="Shop Now" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Image</Label>
                        <TabsContent value="url" className="mt-0">
                            <Input 
                                name="imageUrl" 
                                defaultValue={banner.image.startsWith('/uploads') ? '' : banner.image} 
                                placeholder="https://example.com/image.jpg" 
                            />
                            {banner.image && <p className="text-xs text-muted-foreground mt-1">Current: {banner.image}</p>}
                        </TabsContent>
                        <TabsContent value="file" className="mt-0">
                            <Input name="imageFile" type="file" accept="image/*" />
                            <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>
                        </TabsContent>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-link">Link</Label>
                        <Select name="link" defaultValue={banner.link}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a route" />
                            </SelectTrigger>
                            <SelectContent>
                                {routes.map((route, index) => (
                                    <SelectItem key={index} value={route.path}>
                                        {route.name} ({route.path})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-4 justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Updating...' : 'Update Banner'}
                    </Button>
                </div>
                {state.message && (
                    <p className={`text-sm text-center ${state.message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                        {state.message}
                    </p>
                )}
            </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
