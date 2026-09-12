'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  X,
  ZoomIn,
} from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25
const SWIPE_THRESHOLD = 60

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function ProductImages({ images, productName }) {
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const viewportRef = useRef(null)
  const imageRef = useRef(null)
  const thumbRefs = useRef([])
  const pointersRef = useRef(new Map())
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    startOffset: { x: 0, y: 0 },
    startZoom: 1,
    startDistance: 0,
    moved: false,
    swiping: false,
  })
  const stateRef = useRef({ zoom, offset })
  const applyZoomRef = useRef(null)

  useEffect(() => {
    stateRef.current = { zoom, offset }
  }, [zoom, offset])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const clampOffset = useCallback((nextOffset, nextZoom) => {
    const viewport = viewportRef.current
    const image = imageRef.current
    if (!viewport || !image || nextZoom <= 1) return { x: 0, y: 0 }

    const maxX = Math.max(0, (image.offsetWidth * nextZoom - viewport.clientWidth) / 2)
    const maxY = Math.max(0, (image.offsetHeight * nextZoom - viewport.clientHeight) / 2)

    return {
      x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
      y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
    }
  }, [])

  const computeZoomedView = useCallback(
    (baseOffset, baseZoom, nextZoom, anchor) => {
      const clamped = clampZoom(nextZoom)
      if (clamped === 1) return { zoom: 1, offset: { x: 0, y: 0 } }

      const ratio = clamped / baseZoom
      const next = anchor
        ? {
            x: anchor.x - (anchor.x - baseOffset.x) * ratio,
            y: anchor.y - (anchor.y - baseOffset.y) * ratio,
          }
        : { x: baseOffset.x * ratio, y: baseOffset.y * ratio }

      return { zoom: clamped, offset: clampOffset(next, clamped) }
    },
    [clampOffset]
  )

  const applyZoom = useCallback(
    (nextZoom, anchor) => {
      const current = stateRef.current
      const view = computeZoomedView(current.offset, current.zoom, nextZoom, anchor)
      setZoom(view.zoom)
      setOffset(view.offset)
    },
    [computeZoomedView]
  )

  useEffect(() => {
    applyZoomRef.current = applyZoom
  })

  const goToImage = useCallback(
    (index) => {
      if (!images?.length) return
      const nextIndex = ((index % images.length) + images.length) % images.length
      setMainImageIndex(nextIndex)
      resetZoom()
      setIsLoaded(false)
    },
    [images, resetZoom]
  )

  const handleNext = useCallback(() => goToImage(mainImageIndex + 1), [goToImage, mainImageIndex])
  const handlePrev = useCallback(() => goToImage(mainImageIndex - 1), [goToImage, mainImageIndex])

  const openViewer = useCallback(() => {
    resetZoom()
    setIsLoaded(false)
    setIsModalOpen(true)
  }, [resetZoom])

  const handleOpenChange = useCallback(
    (open) => {
      setIsModalOpen(open)
      if (open) {
        resetZoom()
        setIsLoaded(false)
      }
    },
    [resetZoom]
  )

  useEffect(() => {
    if (!isModalOpen) return

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault()
        handleNext()
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        handlePrev()
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        applyZoomRef.current?.(stateRef.current.zoom + ZOOM_STEP)
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault()
        applyZoomRef.current?.(stateRef.current.zoom - ZOOM_STEP)
      } else if (event.key === "0") {
        event.preventDefault()
        resetZoom()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen, handleNext, handlePrev, resetZoom])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !isModalOpen) return

    const handleWheel = (event) => {
      event.preventDefault()
      const rect = viewport.getBoundingClientRect()
      const anchor = {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      }
      const nextZoom = stateRef.current.zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
      applyZoomRef.current?.(nextZoom, anchor)
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false })
    return () => viewport.removeEventListener("wheel", handleWheel)
  }, [isModalOpen])

  useEffect(() => {
    if (!isModalOpen) return
    const node = thumbRefs.current[mainImageIndex]
    node?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    })
  }, [isModalOpen, mainImageIndex])

  const handlePointerDown = (event) => {
    if (!isModalOpen) return
    if (event.target.closest("button")) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointersRef.current.size === 1) {
      gestureRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startOffset: stateRef.current.offset,
        startZoom: stateRef.current.zoom,
        startDistance: 0,
        moved: false,
        swiping: stateRef.current.zoom === 1 && images.length > 1,
      }
      setIsDragging(stateRef.current.zoom > 1)
      return
    }

    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()]
      gestureRef.current.startDistance = Math.hypot(first.x - second.x, first.y - second.y)
      gestureRef.current.startZoom = stateRef.current.zoom
      gestureRef.current.startOffset = stateRef.current.offset
      gestureRef.current.moved = true
      gestureRef.current.swiping = false
      setIsDragging(true)
    }
  }

  const handlePointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const pointers = [...pointersRef.current.values()]

    if (pointers.length === 2 && viewportRef.current) {
      const distance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
      const startDistance = gestureRef.current.startDistance || distance
      const rect = viewportRef.current.getBoundingClientRect()
      const anchor = {
        x: (pointers[0].x + pointers[1].x) / 2 - rect.left - rect.width / 2,
        y: (pointers[0].y + pointers[1].y) / 2 - rect.top - rect.height / 2,
      }
      const view = computeZoomedView(
        gestureRef.current.startOffset,
        gestureRef.current.startZoom,
        gestureRef.current.startZoom * (distance / startDistance),
        anchor
      )
      setZoom(view.zoom)
      setOffset(view.offset)
      return
    }

    if (pointers.length === 1) {
      const dx = event.clientX - gestureRef.current.startX
      const dy = event.clientY - gestureRef.current.startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) gestureRef.current.moved = true

      if (stateRef.current.zoom > 1) {
        setOffset(
          clampOffset(
            {
              x: gestureRef.current.startOffset.x + dx,
              y: gestureRef.current.startOffset.y + dy,
            },
            stateRef.current.zoom
          )
        )
      }
    }
  }

  const handlePointerUp = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.delete(event.pointerId)

    if (pointersRef.current.size === 0) {
      setIsDragging(false)
      const { startX, swiping, moved } = gestureRef.current
      if (swiping && moved && event.type === "pointerup" && images.length > 1) {
        const dx = event.clientX - startX
        if (Math.abs(dx) >= SWIPE_THRESHOLD) {
          if (dx < 0) handleNext()
          else handlePrev()
        }
      }
      gestureRef.current.moved = false
      gestureRef.current.swiping = false
    } else if (pointersRef.current.size === 1) {
      const [remaining] = [...pointersRef.current.values()]
      gestureRef.current.startX = remaining.x
      gestureRef.current.startY = remaining.y
      gestureRef.current.startOffset = stateRef.current.offset
      gestureRef.current.swiping = false
    }
  }

  const handleDoubleClick = (event) => {
    if (event.target.closest("button")) return
    if (stateRef.current.zoom > 1) {
      resetZoom()
      return
    }

    const viewport = viewportRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    applyZoom(2, {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    })
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src="/placeholder.png"
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    )
  }

  const currentImage = images[mainImageIndex] ?? images[0]
  const hasMultiple = images.length > 1
  const isZoomed = zoom > 1 || offset.x !== 0 || offset.y !== 0

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-white"
        onClick={openViewer}
        aria-label={`Open image viewer for ${productName}`}
      >
        <Image
          src={currentImage}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/5">
          <ZoomIn className="h-10 w-10 text-foreground opacity-0 drop-shadow transition-opacity group-hover:opacity-70" />
        </span>
      </button>

      {hasMultiple && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => goToImage(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={mainImageIndex === i ? "true" : undefined}
              className={cn(
                "relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-white transition-colors hover:border-primary",
                mainImageIndex === i && "border-primary ring-1 ring-primary"
              )}
            >
              <Image src={img} alt="" fill sizes="120px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}

      <DialogPrimitive.Root open={isModalOpen} onOpenChange={handleOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-background/95 backdrop-blur-sm" />
          <DialogPrimitive.Content
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed inset-0 z-50 flex flex-col overflow-hidden bg-background outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[92vh] sm:max-h-[92vh] sm:w-[92vw] sm:max-w-[92vw] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-border"
          >
            <DialogPrimitive.Title className="sr-only">
              {productName} image gallery
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Use the left and right arrow keys to change images, plus and minus to zoom, and 0 to
              reset the zoom.
            </DialogPrimitive.Description>

            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-3 py-2 backdrop-blur sm:px-4">
              <span
                className="min-w-12 text-xs font-medium text-muted-foreground"
                aria-live="polite"
              >
                {mainImageIndex + 1} / {images.length}
              </span>

              <div className="flex items-center gap-0.5 rounded-full border border-border bg-muted/70 p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-foreground hover:bg-background"
                  onClick={resetZoom}
                  disabled={!isZoomed}
                  aria-label="Reset zoom"
                  title="Reset zoom (0)"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-foreground hover:bg-background"
                  onClick={() => applyZoom(stateRef.current.zoom - ZOOM_STEP)}
                  disabled={zoom <= MIN_ZOOM}
                  aria-label="Zoom out"
                  title="Zoom out (-)"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-xs font-semibold tabular-nums text-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-foreground hover:bg-background"
                  onClick={() => applyZoom(stateRef.current.zoom + ZOOM_STEP)}
                  disabled={zoom >= MAX_ZOOM}
                  aria-label="Zoom in"
                  title="Zoom in (+)"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <DialogPrimitive.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-foreground hover:bg-muted"
                  aria-label="Close image viewer"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DialogPrimitive.Close>
            </div>

            <div
              ref={viewportRef}
              className="relative min-h-0 flex-1 touch-none select-none overflow-hidden"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onDoubleClick={handleDoubleClick}
            >
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                  style={{
                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                    transformOrigin: "center",
                  }}
                  className={cn(
                    "will-change-transform",
                    isDragging ? "transition-none" : "transition-[transform,opacity] duration-150",
                    isLoaded ? "opacity-100" : "opacity-0"
                  )}
                >
                  <Image
                    ref={imageRef}
                    src={currentImage}
                    alt={productName}
                    width={1200}
                    height={1200}
                    sizes="100vw"
                    draggable={false}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setIsLoaded(true)}
                    className={cn(
                      "h-auto max-h-[calc(100dvh-11rem)] w-auto max-w-full object-contain sm:max-h-[calc(92vh-8rem)]",
                      isDragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
                    )}
                  />
                </div>
              </div>

              {hasMultiple && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border border-border bg-background/80 text-foreground backdrop-blur hover:bg-muted"
                    onClick={(event) => {
                      event.stopPropagation()
                      handlePrev()
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border border-border bg-background/80 text-foreground backdrop-blur hover:bg-muted"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleNext()
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {hasMultiple && (
              <div className="no-scrollbar flex h-20 shrink-0 items-center overflow-x-auto border-t border-border bg-background/80 px-3 py-2 backdrop-blur">
                <div className="mx-auto flex items-center gap-2">
                  {images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      ref={(node) => {
                        thumbRefs.current[i] = node
                      }}
                      onClick={() => goToImage(i)}
                      aria-label={`View image ${i + 1} of ${images.length}`}
                      aria-current={mainImageIndex === i ? "true" : undefined}
                      className={cn(
                        "relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-card transition-all",
                        mainImageIndex === i
                          ? "border-primary ring-2 ring-primary"
                          : "border-border opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image src={img} alt="" fill sizes="56px" className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}
