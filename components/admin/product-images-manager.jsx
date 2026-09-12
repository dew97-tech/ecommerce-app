'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export function ProductImageManager({ value = [], onChange }) {
  const images = Array.isArray(value) ? value : []
  const [urlInput, setUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  function commit(next) {
    onChange?.(next)
  }

  function handleAddUrl() {
    const url = urlInput.trim()
    if (!url || images.includes(url)) {
      return
    }
    commit([...images, url])
    setUrlInput('')
  }

  function handleUrlKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddUrl()
    }
  }

  async function handleFiles(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) {
      return
    }

    setIsUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          toast.error(data?.message || `Failed to upload ${file.name}`)
          continue
        }
        if (data?.url) {
          uploaded.push(data.url)
        }
      }
      if (uploaded.length > 0) {
        commit([...images, ...uploaded])
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  function moveImage(from, to) {
    if (to < 0 || to >= images.length) {
      return
    }
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    commit(next)
  }

  function removeImage(index) {
    commit(images.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyDown={handleUrlKeyDown}
          placeholder="https://example.com/image.jpg"
          aria-label="Image URL"
          className="flex-1"
        />
        <Button type="button" onClick={handleAddUrl}>
          Add
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={handleFiles}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="gap-1.5"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Uploading…' : 'Upload images'}
      </Button>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <p>No images yet.</p>
          <p className="text-xs">
            Add a URL or upload files to build the gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              title={url}
              className="relative aspect-square overflow-hidden rounded-md border border-border bg-white"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                sizes="160px"
                className="object-contain p-2"
              />
              {index === 0 && (
                <Badge
                  variant="secondary"
                  className="absolute left-1 top-1"
                >
                  Cover
                </Badge>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-background/90 p-1">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveImage(index, 0)}
                    aria-label="Set cover"
                    title="Set cover"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => moveImage(index, index - 1)}
                  aria-label="Move left"
                  title="Move left"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === images.length - 1}
                  onClick={() => moveImage(index, index + 1)}
                  aria-label="Move right"
                  title="Move right"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeImage(index)}
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP or GIF. The first image is used as the storefront
        cover.
      </p>
    </div>
  )
}
