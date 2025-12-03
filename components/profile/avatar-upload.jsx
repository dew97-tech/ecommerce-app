'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Camera, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'

export function AvatarUpload({ currentImage, onUploadComplete }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Color adjustment states
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result)
        setIsOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new window.Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (imageSrc, pixelCrop, adjustments) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Apply color adjustments
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  const handleSave = async () => {
    try {
      setIsUploading(true)

      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels, {
        brightness,
        contrast,
        saturation
      })

      const formData = new FormData()
      formData.append('file', croppedBlob, 'avatar.jpg')

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        onUploadComplete?.(data.imageUrl)
        setIsOpen(false)
        setSelectedImage(null)
        // Reset adjustments
        setBrightness(100)
        setContrast(100)
        setSaturation(100)
        setZoom(1)
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return
    }

    try {
      const response = await fetch('/api/upload-avatar', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        onUploadComplete?.(null)
      } else {
        alert(data.error || 'Failed to remove image')
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      alert('Failed to remove image')
    }
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-32 w-32 rounded-full overflow-hidden bg-muted border-4 border-border relative">
            {currentImage ? (
              <Image
                src={currentImage}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('avatar-input').click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Change Photo
          </Button>
          {currentImage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        <input
          id="avatar-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
            <DialogDescription>
              Crop and adjust your profile picture
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Crop Area */}
            <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
              {selectedImage && (
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  style={{
                    containerStyle: {
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                    }
                  }}
                />
              )}
            </div>

            {/* Zoom Control */}
            <div className="space-y-2">
              <Label>Zoom</Label>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Color Adjustments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Brightness</Label>
                <Slider
                  value={[brightness]}
                  onValueChange={(value) => setBrightness(value[0])}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{brightness}%</span>
              </div>

              <div className="space-y-2">
                <Label>Contrast</Label>
                <Slider
                  value={[contrast]}
                  onValueChange={(value) => setContrast(value[0])}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{contrast}%</span>
              </div>

              <div className="space-y-2">
                <Label>Saturation</Label>
                <Slider
                  value={[saturation]}
                  onValueChange={(value) => setSaturation(value[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{saturation}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  setSelectedImage(null)
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
