'use client'

import { AddToCartButton } from "@/components/add-to-cart-button"
import { AddReviewForm } from "@/components/reviews/add-review-form"
import { ReviewList } from "@/components/reviews/review-list"
import { StarRating } from "@/components/reviews/star-rating"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  let descriptionHtml = product.description

  if (typeof descriptionData === 'object' && descriptionData !== null) {
    descriptionHtml = Object.values(descriptionData).join('<br/><br/>')
  } else if (typeof descriptionData === 'string') {
    // Fallback for failed parsing but looks like JSON/Dict
    let cleaned = descriptionData.trim()
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      // Remove outer braces
      cleaned = cleaned.slice(1, -1)
      // If it looks like 'Key': 'Value', try to extract the value
      // This is a rough heuristic for the specific issue seen
      const parts = cleaned.split("': '")
      if (parts.length > 1) {
         // Take the last part and remove trailing quote
         descriptionHtml = parts[parts.length - 1].replace(/'$/, '')
      } else {
         // Just return the cleaned string without braces
         descriptionHtml = cleaned
      }
    }
  }

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
                            {paymentMethod === 'cash' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
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
                            {paymentMethod === 'emi' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
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

      {/* Tabs Section */}
      <div id="specifications" className="pt-8">
        <Tabs defaultValue="specification" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none mb-6 overflow-x-auto flex-nowrap">
                <TabsTrigger 
                    value="specification" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-semibold text-base"
                >
                    Specification
                </TabsTrigger>
                <TabsTrigger 
                    value="description" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-semibold text-base"
                >
                    Description
                </TabsTrigger>
                <TabsTrigger 
                    value="reviews" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-semibold text-base"
                >
                    Reviews ({product.reviews?.length || 0})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="specification" className="mt-0">
                <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-muted/10">
                        <h3 className="text-xl font-bold">Specification</h3>
                    </div>
                    {specifications && typeof specifications === 'object' ? (
                        <div className="divide-y">
                            {Object.entries(specifications).map(([category, specs], idx) => (
                                <div key={idx} className="p-0">
                                    <div className="bg-muted/30 px-6 py-3 font-semibold text-primary/80 text-sm uppercase tracking-wider">
                                        {category}
                                    </div>
                                    <div className="divide-y">
                                        {typeof specs === 'object' ? Object.entries(specs).map(([key, value], i) => (
                                            <div key={i} className="grid grid-cols-1 md:grid-cols-3 px-6 py-4 hover:bg-muted/5 transition-colors">
                                                <div className="font-medium text-muted-foreground md:col-span-1">{key}</div>
                                                <div className="md:col-span-2 text-sm md:text-base">{value}</div>
                                            </div>
                                        )) : (
                                            <div className="px-6 py-4">{String(specs)}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-muted-foreground">No specifications available.</div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="description" className="mt-0">
                <div className="bg-card rounded-lg border shadow-sm p-8">
                    <h3 className="text-xl font-bold mb-4">Description</h3>
                    <div 
                        className="prose prose-sm max-w-none text-muted-foreground leading-relaxed dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }} 
                    />
                </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
                <div className="bg-card rounded-lg border shadow-sm p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-bold">Reviews ({product.reviews?.length || 0})</h3>
                            <p className="text-muted-foreground text-sm">Get specific details about this product from customers who own it.</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-lg">
                            <span className="font-bold text-2xl">{averageRating.toFixed(1)}</span>
                            <StarRating rating={averageRating} />
                        </div>
                    </div>
                    
                    <AddReviewForm productId={product.id} />
                    <div className="mt-8">
                        <ReviewList reviews={product.reviews || []} />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
