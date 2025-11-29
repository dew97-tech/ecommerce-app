'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCartStore } from "@/store/useCartStore"
import { motion } from "framer-motion"
import { ShoppingCart } from "lucide-react"
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
      className="h-full"
    >
      <Card className="overflow-hidden group h-full flex flex-col border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 bg-card rounded-xl hover:-translate-y-1">
        <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-white p-4">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {product.isTrending && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 shadow-sm font-medium">
              Trending
            </Badge>
          )}
          
          {product.discountedPrice && (
            <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0 shadow-sm font-medium">
              {Math.round(((product.discountedPrice - product.price) / product.discountedPrice) * 100)}% OFF
            </Badge>
          )}
        </Link>
        
        <CardContent className="p-4 flex-1 flex flex-col gap-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {product.category?.name}
          </div>
          
          <Link href={`/products/${product.slug}`} className="flex-1">
            <h3 className="font-medium text-sm leading-snug line-clamp-2 hover:text-primary transition-colors text-foreground">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex flex-col gap-1 mt-2">
             <span className="font-bold text-primary text-xl">৳{product.price.toLocaleString()}</span>
             {product.discountedPrice && (
               <span className="text-xs text-muted-foreground line-through">৳{product.discountedPrice.toLocaleString()}</span>
             )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full gap-2 shadow-none hover:shadow-md transition-all duration-300 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border border-border/50" 
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
