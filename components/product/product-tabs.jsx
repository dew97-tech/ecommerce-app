'use client'

import { AddReviewForm } from "@/components/reviews/add-review-form"
import { ReviewList } from "@/components/reviews/review-list"
import { StarRating } from "@/components/reviews/star-rating"
import { ContentRenderer } from "@/components/common/content-renderer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parseProductData } from "@/lib/product-parser"

export function ProductTabs({ product }) {

  const specifications = parseProductData(product.specifications)
  const descriptionData = parseProductData(product.description)
  

  const descriptionSource = typeof descriptionData === 'object' && descriptionData !== null
    ? Object.values(descriptionData).join('<br/><br/>')
    : String(product.description || '')


  const descriptionHtml = descriptionSource.replace(
    /<div class="section-head">[\s\S]*?<\/div>/i,
    ''
  )

  const reviewCount = product.reviewCount ?? product.reviews?.length ?? 0

  const averageRating = typeof product.averageRating === 'number'
    ? product.averageRating
    : product.reviews?.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      : 0

  return (
    <div id="specifications" className="w-full scroll-mt-24">
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
                  Reviews ({reviewCount})
              </TabsTrigger>
          </TabsList>

          <TabsContent value="specification" className="mt-0">
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                  <div className="border-b px-5 py-4">
                      <h3 className="text-lg font-semibold">Specification</h3>
                  </div>
                  {specifications && typeof specifications === 'object' ? (
                      <div className="divide-y">
                          {Object.entries(specifications).map(([key, value], idx) => {

                              if (typeof value === 'object' && value !== null) {
                                  return (
                                      <div key={idx} className="p-0">
                                          <div className="bg-secondary/60 px-5 py-2.5 text-sm font-semibold text-primary">
                                              {key}
                                          </div>
                                          <div className="divide-y">
                                              {Object.entries(value).map(([subKey, subValue], i) => (
                                                  <div key={i} className="grid grid-cols-1 px-5 py-3.5 md:grid-cols-3">
                                                      <div className="text-sm text-muted-foreground md:col-span-1">{subKey}</div>
                                                      <div className="text-sm text-foreground md:col-span-2">{String(subValue)}</div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  )
                              } else {

                                  return (
                                      <div key={idx} className="grid grid-cols-1 px-5 py-3.5 md:grid-cols-3">
                                          <div className="text-sm text-muted-foreground md:col-span-1">{key}</div>
                                          <div className="text-sm text-foreground md:col-span-2">{String(value)}</div>
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
                  <ContentRenderer
                      content={descriptionHtml}
                      className="text-muted-foreground leading-relaxed"
                  />
              </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
              <div className="bg-card rounded-lg border shadow-sm p-8">
                  <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                          <h3 className="text-xl font-bold">Reviews ({reviewCount})</h3>
                          <p className="mt-1 max-w-xl text-sm text-muted-foreground">Get specific details about this product from customers who own it.</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 rounded-lg bg-muted/30 px-4 py-2">
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
