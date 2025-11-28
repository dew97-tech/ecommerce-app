'use client'

import { AddToCartButton } from "@/components/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { parseProductData } from "@/lib/product-parser"
import { Facebook, Link as LinkIcon, MessageCircle } from "lucide-react"
import { useState } from "react"

export function ProductDetails({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null)
  const [paymentMethod, setPaymentMethod] = useState('cash') // 'cash' or 'emi'
  
  const currentPrice = selectedVariant ? product.price + (selectedVariant.price || 0) : product.price
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock
  const regularPrice = product.discountedPrice || (currentPrice * 1.1) // Fake regular price if not set

  // Parse complex fields
  const specifications = parseProductData(product.specifications)
  const descriptionData = parseProductData(product.description)
  
  // Handle description: if it's an object, join values, otherwise use as string
  const descriptionHtml = typeof descriptionData === 'object' && descriptionData !== null
    ? Object.values(descriptionData).join('<br/><br/>')
    : product.description

  // Parse short description for Key Features
  const keyFeatures = product.shortDescription 
    ? product.shortDescription.split(',').map(s => s.trim())
    : []

  const averageRating = product.reviews?.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4">{product.name}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm mb-6">
          <div className="bg-muted/30 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-bold">৳{currentPrice.toLocaleString()}</span>
            {product.discountedPrice && <span className="line-through text-muted-foreground text-xs">৳{regularPrice.toLocaleString()}</span>}
          </div>
          <div className="bg-muted/30 px-3 py-1 rounded-full flex items-center gap-2">
             <span className="text-muted-foreground">Status:</span>
             <span className={currentStock > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                {currentStock > 0 ? "In Stock" : "Out of Stock"}
             </span>
          </div>
          <div className="bg-muted/30 px-3 py-1 rounded-full flex items-center gap-2">
             <span className="text-muted-foreground">Product Code:</span>
             <span className="font-bold">{product.productCode || product.id.slice(-6)}</span>
          </div>
          <div className="bg-muted/30 px-3 py-1 rounded-full flex items-center gap-2">
             <span className="text-muted-foreground">Brand:</span>
             <span className="font-bold">{product.brand || "Unknown"}</span>
          </div>
        </div>

        {/* Key Features */}
        {keyFeatures.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                <ul className="space-y-1">
                    {keyFeatures.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            {feature}
                        </li>
                    ))}
                </ul>
                <a href="#specifications" className="text-primary text-sm font-medium mt-2 inline-block hover:underline">View More Info</a>
            </div>
        )}

        {/* Payment Options */}
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Payment Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                    onClick={() => setPaymentMethod('cash')}
                >
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 h-4 w-4 rounded-full border border-primary flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-primary' : ''}`}>
                            {paymentMethod === 'cash' && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                        </div>
                        <div>
                            <div className="font-bold text-xl">৳{currentPrice.toLocaleString()}</div>
                            <div className="text-sm font-medium">Cash Discount Price</div>
                            <div className="text-xs text-muted-foreground mt-1">Online / Cash Payment</div>
                        </div>
                    </div>
                </div>
                <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'emi' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                    onClick={() => setPaymentMethod('emi')}
                >
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 h-4 w-4 rounded-full border border-primary flex items-center justify-center ${paymentMethod === 'emi' ? 'bg-primary' : ''}`}>
                            {paymentMethod === 'emi' && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                        </div>
                        <div>
                            <div className="font-bold text-xl">৳{Math.round(regularPrice / 12).toLocaleString()}/month</div>
                            <div className="text-sm font-medium">Regular Price: ৳{Math.round(regularPrice).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground mt-1">0% EMI for up to 12 Months***</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
            <AddToCartButton product={{ ...product, selectedVariant }} />
        </div>
        
        {/* Share */}
        <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
            <span>Share:</span>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-blue-100 hover:text-blue-600">
                    <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-green-100 hover:text-green-600">
                    <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-gray-200">
                    <LinkIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}
