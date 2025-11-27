'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import fs from 'node:fs/promises'
import path from 'node:path'
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(0),
  discountedPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  isTrending: z.coerce.boolean().optional(),
  images: z.string().min(1), // JSON string
})

export async function createProduct(prevState, formData) {
  // Handle File Uploads
  const imageFiles = formData.getAll("imageFiles")
  let imageUrls = formData.get("images") || ""

  if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
      const uploadedPaths = []
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      
      try {
          await fs.access(uploadDir)
      } catch {
          await fs.mkdir(uploadDir, { recursive: true })
      }

      for (const file of imageFiles) {
          const buffer = Buffer.from(await file.arrayBuffer())
          const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
          await fs.writeFile(path.join(uploadDir, filename), buffer)
          uploadedPaths.push(`/uploads/${filename}`)
      }
      
      imageUrls = JSON.stringify(uploadedPaths)
  } else {
      const urls = imageUrls.split(',').map(u => u.trim()).filter(u => u)
      if (urls.length > 0) {
        imageUrls = JSON.stringify(urls)
      }
  }

  const validatedFields = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    discountedPrice: formData.get("discountedPrice"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isTrending: formData.get("isTrending") === "on",
    images: imageUrls, 
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Product.",
    }
  }

  const { name, slug, description, price, discountedPrice, stock, categoryId, isTrending, images } = validatedFields.data
  
  // Handle variants
  const variantsData = formData.get("variants")
  let variants = []
  
  if (variantsData) {
    try {
      variants = JSON.parse(variantsData).filter(v => v.color || v.size || v.capacity)
    } catch (e) {
      console.error("Failed to parse variants:", e)
    }
  }

  try {
    await db.product.create({
      data: {
        name,
        slug,
        description,
        price,
        discountedPrice,
        stock,
        categoryId,
        isTrending,
        images,
        variants: {
          create: variants.map(v => ({
            color: v.color || null,
            size: v.size || null,
            capacity: v.capacity || null,
            stock: v.stock || 0,
            price: v.price || 0,
          }))
        }
      },
    })
  } catch (error) {
    console.error(error)
    return {
      message: "Database Error: Failed to Create Product.",
    }
  }

  revalidatePath("/admin/products")
  redirect("/admin/products")
}

export async function updateProduct(id, prevState, formData) {
    // Handle File Uploads
    const imageFiles = formData.getAll("imageFiles")
    let imageUrls = formData.get("images") || ""
  
    if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
        const uploadedPaths = []
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        
        try {
            await fs.access(uploadDir)
        } catch {
            await fs.mkdir(uploadDir, { recursive: true })
        }
  
        for (const file of imageFiles) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
            await fs.writeFile(path.join(uploadDir, filename), buffer)
            uploadedPaths.push(`/uploads/${filename}`)
        }
        
        imageUrls = JSON.stringify(uploadedPaths)
    } else {
        if (imageUrls.startsWith('[')) {
            // Already JSON, likely unchanged
        } else {
             const urls = imageUrls.split(',').map(u => u.trim()).filter(u => u)
             if (urls.length > 0) {
               imageUrls = JSON.stringify(urls)
             }
        }
    }

    const validatedFields = productSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      price: formData.get("price"),
      discountedPrice: formData.get("discountedPrice"),
      stock: formData.get("stock"),
      categoryId: formData.get("categoryId"),
      isTrending: formData.get("isTrending") === "on",
      images: imageUrls,
    })
  
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Missing Fields. Failed to Update Product.",
      }
    }
  
    const { name, slug, description, price, discountedPrice, stock, categoryId, isTrending, images } = validatedFields.data
    
    // Handle variants
    const variantsData = formData.get("variants")
    let variants = []
    
    if (variantsData) {
      try {
        variants = JSON.parse(variantsData).filter(v => v.color || v.size || v.capacity)
      } catch (e) {
        console.error("Failed to parse variants:", e)
      }
    }
  
    try {
      // Delete existing variants
      await db.variant.deleteMany({
        where: { productId: id }
      })
      
      await db.product.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          price,
          discountedPrice,
          stock,
          categoryId,
          isTrending,
          images,
          variants: {
            create: variants.map(v => ({
              color: v.color || null,
              size: v.size || null,
              capacity: v.capacity || null,
              stock: v.stock || 0,
              price: v.price || 0,
            }))
          }
        },
      })
    } catch (error) {
      console.error(error)
      return {
        message: "Database Error: Failed to Update Product.",
      }
    }
  
    revalidatePath("/admin/products")
    redirect("/admin/products")
}

export async function deleteProduct(id) {
  try {
    await db.product.delete({
      where: { id },
    })
    revalidatePath("/admin/products")
    return { message: "Deleted Product." }
  } catch (error) {
    return { message: "Database Error: Failed to Delete Product." }
  }
}
