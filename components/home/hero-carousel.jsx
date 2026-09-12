"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import Autoplay from "embla-carousel-autoplay";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Monitor } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const SRCSET_WIDTHS = {
  desktop: [960, 1280, 1920],
  mobile: [480, 720, 1080],
};

function buildSrcSet(image, variant) {
  if (!image || !image.startsWith("/banners/") || !image.endsWith(".webp")) {
    return undefined;
  }

  const base = image.replace(/\.webp$/i, "");
  return SRCSET_WIDTHS[variant]
    .map((width) => `${base}-${width}.webp ${width}w`)
    .join(", ");
}

export function HeroCarousel({ banners = [] }) {
  const prefersReducedMotion = useReducedMotion();
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);

  const autoplay = useRef(
    Autoplay({ delay: 6000, stopOnMouseEnter: true, stopOnInteraction: false })
  );
  const plugins = useMemo(
    () => (prefersReducedMotion ? [] : [autoplay.current]),
    [prefersReducedMotion]
  );

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);

    return () => api.off("select", onSelect);
  }, [api]);

  if (banners.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-gradient-to-br from-primary/10 via-background to-background px-6 py-12 sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {siteConfig.name}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {siteConfig.tagline} — {siteConfig.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/products">Shop All Products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pc-builder">
              <Monitor className="mr-2 h-4 w-4" />
              PC Builder
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <Carousel
        setApi={setApi}
        plugins={plugins}
        opts={{ loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {banners.map((banner, index) => {
            const hasMobileSrcSet = banner.imageMobile?.startsWith("/banners/");
            const mobileSrcSet = buildSrcSet(
              banner.imageMobile || banner.image,
              "mobile"
            );
            const desktopSrcSet = buildSrcSet(banner.image, "desktop");

            return (
              <CarouselItem key={banner.id ?? index} className="pl-0">
                <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
                  <div className="relative aspect-[4/5] sm:aspect-[16/7] lg:aspect-[3/1]">
                    <picture>
                      {hasMobileSrcSet && mobileSrcSet && (
                        <source
                          media="(max-width: 767px)"
                          srcSet={mobileSrcSet}
                          sizes="100vw"
                          type="image/webp"
                        />
                      )}
                      <img
                        src={banner.image}
                        srcSet={desktopSrcSet}
                        sizes="100vw"
                        alt={banner.title || `${siteConfig.name} promotion`}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                      />
                    </picture>

                    <div className="absolute inset-0 flex items-start sm:items-center">
                      <div className="max-w-xl px-5 pb-5 pt-6 sm:px-10 sm:py-8 md:px-14">
                        {banner.title && (
                          <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                            {banner.title}
                          </h2>
                        )}
                        {banner.buttonText && (
                          <Button asChild size="lg" className="mt-4 sm:mt-6">
                            <Link href={banner.link || "/products"}>
                              {banner.buttonText}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {banners.length > 1 && (
          <>
            <CarouselPrevious className="bottom-3 left-3 top-auto h-9 w-9 border-border bg-background/90 text-foreground hover:bg-background disabled:opacity-40 sm:bottom-4 sm:left-4" />
            <CarouselNext className="bottom-3 right-3 top-auto h-9 w-9 border-border bg-background/90 text-foreground hover:bg-background disabled:opacity-40 sm:bottom-4 sm:right-4" />
          </>
        )}
      </Carousel>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-4">
          {banners.map((banner, index) => (
            <button
              key={banner.id ?? index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={current === index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                current === index
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-slate-400/70 hover:bg-slate-500"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
