'use server'

import { db } from "@/lib/db"

export async function getProductsByCategory(categoryName, query = "", options = {}) {
  try {
    const { page = 1, limit = 20, minPrice, maxPrice, brand } = options
    const skip = (page - 1) * limit

    // Map UI labels to potential DB category names
    const categoryAliases = {
      'Processor': ['Processor', 'CPU'],
      'Motherboard': ['Motherboard', 'Mainboard'],
      'RAM': ['RAM', 'Memory', 'Desktop Ram'],
      'Storage': ['SSD', 'HDD', 'Storage', 'Hard Drive'],
      'Graphics Card': ['Graphics Card', 'GPU', 'VGA'],
      'Power Supply': ['Power Supply', 'PSU'],
      'Casing': ['Casing', 'Case', 'Chassis', 'Enclosure'],
      'Monitor': ['Monitor', 'Display'],
      'Keyboard': ['Keyboard'],
      'Mouse': ['Mouse'],
      'Headphone': ['Headphone', 'Headset'],
      'UPS': ['UPS'],
      'CPU Cooler': ['Cooler', 'Fan', 'Liquid Cooler']
    }

    const aliases = categoryAliases[categoryName] || [categoryName]
    
    // Find categories matching any of the aliases
    const categories = await db.category.findMany({
      where: {
        OR: aliases.map(alias => ({
          name: {
            contains: alias,
            // mode: 'insensitive' // Add if using Postgres
          }
        }))
      }
    })

    if (categories.length === 0) {
      return { products: [], totalPages: 0, brands: [] }
    }

    const categoryIds = categories.map(c => c.id)

    // Build filter conditions
    const where = {
      categoryId: { in: categoryIds },
      name: { contains: query },
      stock: { gt: 0 },
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...(brand && { brand: brand })
    }

    // Get total count for pagination
    const totalCount = await db.product.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    // Get available brands for this category (ignoring other filters for better UX, or respecting them?)
    // Usually we want all brands in the category to populate the filter list
    const brandResults = await db.product.findMany({
      where: { categoryId: { in: categoryIds }, stock: { gt: 0 } },
      select: { brand: true },
      distinct: ['brand']
    })
    const brands = brandResults.map(p => p.brand).filter(Boolean).sort()

    const products = await db.product.findMany({
      where,
      orderBy: { price: 'asc' },
      skip,
      take: limit
    })

    // Parse images similar to lib/data.js
    const processedProducts = products.map(product => {
      let imageList = []
      if (product.images) {
        try {
          const parsed = JSON.parse(product.images)
          if (Array.isArray(parsed)) {
            imageList = parsed
          } else {
            imageList = [product.images]
          }
        } catch (e) {
          // Fallback for comma-separated or simple string
          imageList = product.images.replace(/[\[\]"]/g, '').split(',')
        }
      }
      return { ...product, images: imageList }
    })

    return { products: processedProducts, totalPages, brands }
  } catch (error) {
    console.error("Error fetching products for builder:", error)
    return { products: [], totalPages: 0, brands: [] }
  }
}
