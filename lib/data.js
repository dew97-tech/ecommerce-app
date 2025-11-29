import { db } from "@/lib/db"

export async function getCategoryData() {
  // Fetch featured categories with their products to extract brands and previews
  const featuredCategories = await db.category.findMany({
    // Fetch all categories
    include: {
      products: {
        take: 20, // Fetch enough to get diverse brands
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountedPrice: true,
          images: true,
          brand: true,
        }
      }
    },
    orderBy: [
      { isFeatured: 'desc' },
      { name: 'asc' }
    ]
  })

  // Process data for Mega Menu
  return featuredCategories.map(cat => {
    // Extract unique brands from products
    const brands = [...new Set(cat.products.map(p => p.brand).filter(Boolean))].sort()
    
    // Clean up product images
    const products = cat.products.map(product => {
        let firstImage = ''
        if (product.images) {
            try {
                // Try parsing as JSON array first (e.g. '["url1", "url2"]')
                const parsed = JSON.parse(product.images)
                if (Array.isArray(parsed)) {
                    firstImage = parsed[0]
                } else {
                    firstImage = product.images.split(',')[0]
                }
            } catch (e) {
                // Fallback for simple comma-separated strings or plain URLs
                // Remove potential brackets/quotes if malformed
                const clean = product.images.replace(/[\[\]"]/g, '')
                firstImage = clean.split(',')[0]
            }
        }
        return { ...product, images: firstImage }
    })

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      brands: brands,
      products: products
    }
  })
}
