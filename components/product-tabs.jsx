'use client'

import { AddReviewForm } from "@/components/reviews/add-review-form"
import { ReviewList } from "@/components/reviews/review-list"
import { StarRating } from "@/components/reviews/star-rating"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parseProductData } from "@/lib/product-parser"

export function ProductTabs({ product }) {
  // Parse complex fields
  const specifications = parseProductData(product.specifications)
  const descriptionData = parseProductData(product.description)
  
  // Handle description: if it's an object, join values, otherwise use as string
  const descriptionHtml = typeof descriptionData === 'object' && descriptionData !== null
    ? Object.values(descriptionData).join('<br/><br/>')
    : product.description

  const averageRating = product.reviews?.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0

  return (
    <div id="specifications" className="w-full">
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
                          {Object.entries(specifications).map(([key, value], idx) => {
                              // Check if the value is an object (nested category)
                              if (typeof value === 'object' && value !== null) {
                                  return (
                                      <div key={idx} className="p-0">
                                          <div className="bg-muted/30 px-6 py-3 font-semibold text-primary/80 text-sm uppercase tracking-wider">
                                              {key}
                                          </div>
                                          <div className="divide-y">
                                              {Object.entries(value).map(([subKey, subValue], i) => (
                                                  <div key={i} className="grid grid-cols-1 md:grid-cols-3 px-6 py-4 hover:bg-muted/5 transition-colors">
                                                      <div className="font-medium text-muted-foreground md:col-span-1">{subKey}</div>
                                                      <div className="md:col-span-2 text-sm md:text-base">{String(subValue)}</div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  )
                              } else {
                                  // Flat key-value pair
                                  return (
                                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 px-6 py-4 hover:bg-muted/5 transition-colors">
                                          <div className="font-medium text-muted-foreground md:col-span-1">{key}</div>
                                          <div className="md:col-span-2 text-sm md:text-base">{String(value)}</div>
                                      </div>
                                  )
                              }
                          })}
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
  )
}
