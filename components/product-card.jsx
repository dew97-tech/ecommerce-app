'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCartStore } from "@/store/useCartStore"
import { motion } from "framer-motion"
import { ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

export function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem)
  
  const handleAddToCart = (e) => {
    e.preventDefault()
    
    let image = "/placeholder.png"
    if (product.images) {
      try {
        const images = JSON.parse(product.images)
        if (Array.isArray(images) && images.length > 0) {
          image = images[0]
        }
      } catch (e) {
        image = product.images.split(',')[0]
      }
    }
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: image,
      quantity: 1
    }
    
    addItem(cartItem)
    toast.success("Added to cart")
  }

  let displayImage = "/placeholder.png"
  if (product.images) {
    try {
      const images = JSON.parse(product.images)
      if (Array.isArray(images) && images.length > 0) {
        displayImage = images[0]
      }
    } catch (e) {
      displayImage = product.images.split(',')[0]
    }
  }

  if (displayImage && !displayImage.startsWith('http') && !displayImage.startsWith('/')) {
      displayImage = `/${displayImage}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className="overflow-hidden group h-full flex flex-col border-0 shadow-md hover:shadow-2xl transition-all duration-500 bg-card">
        <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-accent/30 to-accent/10">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {product.isTrending && (
            <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm border-0 shadow-lg">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Trending
            </Badge>
          )}
          
          {product.discountedPrice && (
            <Badge className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm border-0 shadow-lg">
              {Math.round(((product.discountedPrice - product.price) / product.discountedPrice) * 100)}% OFF
            </Badge>
          )}
        </Link>
        
        <CardContent className="p-5 flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {product.category?.name}
            </span>
          </div>
          
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-baseline gap-2 pt-1">
             <span className="font-bold text-primary text-2xl">৳{product.price.toLocaleString()}</span>
             {product.discountedPrice && (
               <span className="text-sm text-muted-foreground line-through">৳{product.discountedPrice.toLocaleString()}</span>
             )}
          </div>
        </CardContent>
        
        <CardFooter className="p-5 pt-0">
          <Button 
            className="w-full gap-2 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]" 
            onClick={handleAddToCart}
            size="lg"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
