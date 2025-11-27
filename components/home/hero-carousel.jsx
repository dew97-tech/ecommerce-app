'use client'

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import * as React from "react"

export function HeroCarousel({ banners = [] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  if (banners.length === 0) {
      return (
        <div className="w-full h-[300px] md:h-[500px] bg-gray-200 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">No banners available</p>
        </div>
      )
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="border-0 shadow-none">
                <CardContent className="flex aspect-[21/9] items-center justify-center p-0 relative rounded-lg overflow-hidden">
                  <Image 
                    src={banner.image} 
                    alt={banner.title || "Banner"} 
                    fill 
                    className="object-cover"
                    priority={index === 0}
                  />
                  {banner.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                          <h2 className="text-xl md:text-3xl font-bold">{banner.title}</h2>
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  )
}
