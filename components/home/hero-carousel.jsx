'use client'

import { Button } from "@/components/ui/button"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

export function HeroCarousel({ banners = [] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  if (banners.length === 0) {
      return (
        <div className="w-full h-[300px] md:h-[500px] bg-muted/20 flex items-center justify-center rounded-2xl border border-border/50">
            <p className="text-muted-foreground">No banners available</p>
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-sm border border-border/50">
                  <div className="flex aspect-[21/9] items-center justify-center p-0 relative min-h-[300px] md:min-h-[500px] bg-muted">
                    <Image 
                      src={banner.image} 
                      alt={banner.title || "Banner"} 
                      fill 
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                    
                    {(banner.title || banner.description) && (
                      <div className="absolute bottom-0 left-0 top-0 w-full md:w-2/3 p-8 md:p-16 flex flex-col justify-center gap-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="max-w-xl"
                        >
                          {banner.title && (
                            <h2 className="text-3xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                              {banner.title}
                            </h2>
                          )}
                          {banner.description && (
                            <p className="text-white/90 text-sm md:text-lg mb-8 leading-relaxed font-medium">
                              {banner.description}
                            </p>
                          )}
                          <Link href={banner.link || "/products"}>
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg gap-2 rounded-lg px-8 h-12 text-base font-semibold">
                              <ShoppingBag className="h-5 w-5" />
                              {banner.buttonText || "Shop Now"}
                            </Button>
                          </Link>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 border-0 text-white backdrop-blur-sm h-12 w-12" />
      <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 border-0 text-white backdrop-blur-sm h-12 w-12" />
    </Carousel>
  )
}
