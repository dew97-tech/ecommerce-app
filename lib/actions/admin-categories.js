'use server'

import { requireAdmin } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { db } from "@/lib/db"
import { saveImageFile } from "@/lib/services/upload"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
})

function revalidateCatalog() {
  revalidateTag(CACHE_TAGS.categories, "max")
  revalidateTag(CACHE_TAGS.nav, "max")
  revalidateTag(CACHE_TAGS.products, "max")
}

async function resolveCategoryImage(formData) {
  const file = formData.get("imageFile")

  if (file && typeof file !== "string" && file.size > 0) {
    return saveImageFile(file, "categories")
  }

  const image = String(formData.get("image") ?? "").trim()
  return image || null
}

export async function createCategory(formData) {
  await requireAdmin()

  const parse = categorySchema.safeParse({
    name: formData.get('name'),
    image: formData.get('image'),
    isFeatured: formData.get('isFeatured') === 'on',
  })

  if (!parse.success) {
    return { message: "Invalid data" }
  }

  const { name, isFeatured } = parse.data
  const image = await resolveCategoryImage(formData)
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `category-${Date.now()}`

  try {
    await db.category.create({
      data: {
        name,
        slug,
        image: image || null,
        isFeatured,
      },
    })
    revalidatePath('/admin/categories')
    revalidateCatalog()
  } catch (error) {
    console.error(error)
    if (error.code === 'P2002') {
        return { message: "Category with this name already exists." }
    }
    return { message: "Failed to create category" }
  }

  redirect('/admin/categories')
}

async function getOrCreateUncategorizedCategory() {
  let uncategorized = await db.category.findFirst({
    where: { name: "Uncategorized" }
  })

  if (!uncategorized) {
    uncategorized = await db.category.create({
      data: {
        name: "Uncategorized",
        slug: "uncategorized",
        isFeatured: false
      }
    })
  }
  return uncategorized
}

export async function deleteCategory(id) {
  await requireAdmin()

  try {
    const category = await db.category.findUnique({ where: { id } })
    if (!category) return { message: "Category not found" }
    
    if (category.name === "Uncategorized") {
        return { message: "Cannot delete the 'Uncategorized' category" }
    }

    const uncategorized = await getOrCreateUncategorizedCategory()


    await db.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: uncategorized.id }
    })

    await db.category.delete({
      where: { id },
    })
    revalidatePath('/admin/categories')
    revalidateCatalog()
    return { message: "Category deleted successfully" }
  } catch (error) {
    console.error("Delete error:", error)
    return { message: "Failed to delete category" }
  }
}

export async function updateCategory(id, formData) {
  await requireAdmin()

  const parse = categorySchema.safeParse({
    name: formData.get('name'),
    image: formData.get('image'),
    isFeatured: formData.get('isFeatured') === 'on',
  })

  if (!parse.success) {
    return { message: "Invalid data" }
  }

  const { name, isFeatured } = parse.data
  const image = await resolveCategoryImage(formData)
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `category-${Date.now()}`

  try {
    await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        image: image || null,
        isFeatured,
      },
    })
    revalidatePath('/admin/categories')
    revalidateCatalog()
    return { message: "Category updated successfully" }
  } catch (error) {
    return { message: "Failed to update category" }
  }
}

export async function deleteCategories(ids) {
  await requireAdmin()

  try {
    const uncategorized = await getOrCreateUncategorizedCategory()
    

    const idsToDelete = ids.filter(id => id !== uncategorized.id)
    
    if (idsToDelete.length === 0) {
        return { message: "No categories to delete (cannot delete Uncategorized)" }
    }


    await db.product.updateMany({
        where: { 
            categoryId: { in: idsToDelete } 
        },
        data: { categoryId: uncategorized.id }
    })

    await db.category.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    })
    revalidatePath('/admin/categories')
    revalidateCatalog()
    return { message: "Categories deleted successfully" }
  } catch (error) {
    console.error("Bulk delete error:", error)
    return { message: "Failed to delete categories" }
  }
}
