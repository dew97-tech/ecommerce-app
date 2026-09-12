'use server'

import { requireAdmin } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { db } from "@/lib/db"
import { saveImageFile } from "@/lib/services/upload"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  specifications: z.string().optional(),
  brand: z.string().optional(),
  productCode: z.string().nullable().optional(),
  price: z.coerce.number().min(0),
  discountedPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  isTrending: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  availabilityStatus: z.string().optional(),
  images: z.string().min(1), 
})

const emptyToNull = (value) => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

function revalidateCatalog() {
  revalidateTag(CACHE_TAGS.products, "max")
  revalidateTag(CACHE_TAGS.nav, "max")
  revalidateTag(CACHE_TAGS.categories, "max")
}

export async function createProduct(prevState, formData) {
  await requireAdmin()


  const imageFiles = formData.getAll("imageFiles")
  let imageUrls = formData.get("images") || ""

  if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
      try {
          const uploadedPaths = []
          for (const file of imageFiles) {
              if (file.size === 0) continue
              uploadedPaths.push(await saveImageFile(file))
          }
          if (uploadedPaths.length > 0) {
              imageUrls = JSON.stringify(uploadedPaths)
          }
      } catch (error) {
          return { message: error.message || "Failed to upload images." }
      }
  } else {
      if (imageUrls.startsWith('[')) {

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
    shortDescription: formData.get("shortDescription"),
    specifications: formData.get("specifications"),
    brand: formData.get("brand"),
    productCode: emptyToNull(formData.get("productCode")),
    price: formData.get("price"),
    discountedPrice: formData.get("discountedPrice"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isTrending: formData.get("isTrending") === "on",
    isActive: formData.get("isActive") === "on",
    availabilityStatus: formData.get("availabilityStatus") || "IN_STOCK",
    images: imageUrls, 
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Product.",
    }
  }

  const { name, slug, description, shortDescription, specifications, brand, productCode, price, discountedPrice, stock, categoryId, isTrending, isActive, availabilityStatus, images } = validatedFields.data
  

  const variantsData = formData.get("variants")
  let variants = []
  
  if (variantsData) {
    try {
      variants = JSON.parse(variantsData).filter(v => v.color || v.size || v.capacity)
    } catch (e) {
      console.error("Failed to parse variants:", e)
    }
  }

  let created
  try {
    created = await db.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        specifications,
        brand,
        productCode,
        price,
        discountedPrice,
        stock,
        categoryId,
        isTrending,
        isActive,
        availabilityStatus,
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
    if (error.code === "P2002") {
      return { message: "A product with this slug or product code already exists." }
    }
    return {
      message: "Database Error: Failed to Create Product.",
    }
  }

  revalidatePath("/admin/products")
  revalidateCatalog()
  return { success: true, productId: created.id, message: "Product created." }
}

export async function updateProduct(id, prevState, formData) {
    await requireAdmin()


    const imageFiles = formData.getAll("imageFiles")
    let imageUrls = formData.get("images") || ""
  
    if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
        try {
            const uploadedPaths = []
            for (const file of imageFiles) {
                if (file.size === 0) continue
                uploadedPaths.push(await saveImageFile(file))
            }
            if (uploadedPaths.length > 0) {
                imageUrls = JSON.stringify(uploadedPaths)
            }
        } catch (error) {
            return { message: error.message || "Failed to upload images." }
        }
    } else {
        if (imageUrls.startsWith('[')) {

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
      shortDescription: formData.get("shortDescription"),
      specifications: formData.get("specifications"),
      brand: formData.get("brand"),
      productCode: emptyToNull(formData.get("productCode")),
      price: formData.get("price"),
      discountedPrice: formData.get("discountedPrice"),
      stock: formData.get("stock"),
      categoryId: formData.get("categoryId"),
      isTrending: formData.get("isTrending") === "on",
      isActive: formData.get("isActive") === "on",
      availabilityStatus: formData.get("availabilityStatus") || "IN_STOCK",
      images: imageUrls,
    })
  
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Missing Fields. Failed to Update Product.",
      }
    }
  
    const { name, slug, description, shortDescription, specifications, brand, productCode, price, discountedPrice, stock, categoryId, isTrending, isActive, availabilityStatus, images } = validatedFields.data
    

    const variantsSubmitted = formData.has("variants")
    const variantsData = formData.get("variants")
    let variants = []
    
    if (variantsSubmitted && variantsData) {
      try {
        variants = JSON.parse(variantsData).filter(v => v.color || v.size || v.capacity)
      } catch (e) {
        console.error("Failed to parse variants:", e)
      }
    }
  
    try {
      await db.$transaction(async (tx) => {
        if (variantsSubmitted) {
          await tx.variant.deleteMany({
            where: { productId: id }
          })
        }

        await tx.product.update({
          where: { id },
          data: {
            name,
            slug,
            description,
            shortDescription,
            specifications,
            brand,
            productCode,
            price,
            discountedPrice,
            stock,
            categoryId,
            isTrending,
            isActive,
            availabilityStatus,
            images,
            ...(variantsSubmitted && {
              variants: {
                create: variants.map(v => ({
                  color: v.color || null,
                  size: v.size || null,
                  capacity: v.capacity || null,
                  stock: v.stock || 0,
                  price: v.price || 0,
                }))
              }
            })
          },
        })
      })
    } catch (error) {
      console.error(error)
      if (error.code === "P2002") {
        return { message: "A product with this slug or product code already exists." }
      }
      return {
        message: "Database Error: Failed to Update Product.",
      }
    }
  
    revalidatePath("/admin/products")
    revalidateCatalog()
    return { success: true, message: "Product updated." }
}

export async function deleteProduct(id) {
  await requireAdmin()

  try {
    await db.product.delete({
      where: { id },
    })
    revalidatePath("/admin/products")
    revalidateCatalog()
    return { message: "Deleted Product." }
  } catch (error) {
    if (error.code === "P2003") {
      return { message: "Cannot delete this product because it has existing orders or reviews." }
    }
    return { message: "Database Error: Failed to Delete Product." }
  }
}
