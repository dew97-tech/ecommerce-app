'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
})

export async function createCategory(prevState, formData) {
  const parse = categorySchema.safeParse({
    name: formData.get('name'),
    image: formData.get('image'),
    isFeatured: formData.get('isFeatured') === 'on',
  })

  if (!parse.success) {
    return { message: "Invalid data" }
  }

  const { name, image, isFeatured } = parse.data
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

  try {
    await db.category.create({
      data: {
        name,
        slug,
        image,
        isFeatured,
      },
    })
    revalidatePath('/admin/categories')
    return { message: "Category created successfully" }
  } catch (error) {
    console.error(error)
    if (error.code === 'P2002') {
        return { message: "Category with this name already exists." }
    }
    return { message: "Failed to create category" }
  }
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
  try {
    const category = await db.category.findUnique({ where: { id } })
    if (!category) return { message: "Category not found" }
    
    if (category.name === "Uncategorized") {
        return { message: "Cannot delete the 'Uncategorized' category" }
    }

    const uncategorized = await getOrCreateUncategorizedCategory()

    // Move products to Uncategorized
    await db.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: uncategorized.id }
    })

    await db.category.delete({
      where: { id },
    })
    revalidatePath('/admin/categories')
    return { message: "Category deleted successfully" }
  } catch (error) {
    console.error("Delete error:", error)
    return { message: "Failed to delete category" }
  }
}

export async function updateCategory(id, formData) {
  const parse = categorySchema.safeParse({
    name: formData.get('name'),
    image: formData.get('image'),
    isFeatured: formData.get('isFeatured') === 'on',
  })

  if (!parse.success) {
    return { message: "Invalid data" }
  }

  const { name, image, isFeatured } = parse.data
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

  try {
    await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        image,
        isFeatured,
      },
    })
    revalidatePath('/admin/categories')
    return { message: "Category updated successfully" }
  } catch (error) {
    return { message: "Failed to update category" }
  }
}

export async function deleteCategories(ids) {
  try {
    const uncategorized = await getOrCreateUncategorizedCategory()
    
    // Filter out Uncategorized from deletion list
    const idsToDelete = ids.filter(id => id !== uncategorized.id)
    
    if (idsToDelete.length === 0) {
        return { message: "No categories to delete (cannot delete Uncategorized)" }
    }

    // Move products to Uncategorized
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
    return { message: "Categories deleted successfully" }
  } catch (error) {
    console.error("Bulk delete error:", error)
    return { message: "Failed to delete categories" }
  }
}
