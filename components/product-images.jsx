'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Minus, Plus, X, ZoomIn } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"

export function ProductImages({ images, productName }) {
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Reset zoom when image changes
  useEffect(() => {
    setZoomLevel(1)
  }, [mainImageIndex])

  const handleNext = useCallback((e) => {
    e?.stopPropagation()
    setMainImageIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handlePrev = useCallback((e) => {
    e?.stopPropagation()
    setMainImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const handleZoomIn = (e) => {
    e.stopPropagation()
    setZoomLevel(prev => Math.min(prev + 0.5, 4))
  }

  const handleZoomOut = (e) => {
    e.stopPropagation()
    setZoomLevel(prev => Math.max(prev - 0.5, 1))
  }

  const handleKeyDown = useCallback((e) => {
    if (!isModalOpen) return
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'Escape') setIsModalOpen(false)
  }, [isModalOpen, handleNext, handlePrev])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!images || images.length === 0) {
    return (
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image src="/placeholder.png" alt={productName} fill className="object-cover" />
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square bg-white rounded-lg overflow-hidden border cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
         <Image
           src={images[mainImageIndex]}
           alt={productName}
           fill
           className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
         />
         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 drop-shadow-md" />
         </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div 
            key={i} 
            className={cn(
                "relative aspect-square bg-white rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors",
                mainImageIndex === i && "border-primary ring-1 ring-primary"
            )}
            onClick={() => setMainImageIndex(i)}
          >
            <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-contain p-2" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-black/95 border-none text-white overflow-hidden flex flex-col">
            <DialogTitle className="sr-only">Product Image Gallery</DialogTitle>
            {/* Header Controls */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <div className="flex items-center bg-black/50 rounded-full p-1 border border-white/10 backdrop-blur-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={handleZoomOut}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={handleZoomIn}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/20 rounded-full bg-black/50 border border-white/10" onClick={() => setIsModalOpen(false)}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mainImageIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full h-full flex items-center justify-center"
                    >
                         <div 
                            className="relative w-full h-full flex items-center justify-center overflow-auto"
                            style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
                         >
                            <motion.div
                                animate={{ scale: zoomLevel }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="relative w-full h-full flex items-center justify-center"
                            >
                                <Image 
                                    src={images[mainImageIndex]} 
                                    alt={productName} 
                                    fill 
                                    className="object-contain" 
                                    priority
                                />
                            </motion.div>
                         </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-white/20 border border-white/10 z-40"
                    onClick={handlePrev}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-white/20 border border-white/10 z-40"
                    onClick={handleNext}
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Footer Thumbnails */}
            <div className="h-20 bg-black/80 flex items-center justify-center gap-2 p-2 overflow-x-auto z-50">
                {images.map((img, i) => (
                    <div 
                        key={i} 
                        className={cn(
                            "relative h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all opacity-50 hover:opacity-100",
                            mainImageIndex === i ? "border-primary opacity-100" : "border-transparent"
                        )}
                        onClick={() => setMainImageIndex(i)}
                    >
                        <Image src={img} alt="thumbnail" fill className="object-cover" />
                    </div>
                ))}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
