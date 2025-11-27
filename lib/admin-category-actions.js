'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
})

export async function createCategory(prevState, formData) {
  const parse = categorySchema.safeParse({
    name: formData.get('name'),
    image: formData.get('image'),
  })

  if (!parse.success) {
    return { message: "Invalid data" }
  }

  const { name, image } = parse.data
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

  try {
    await db.category.create({
      data: {
        name,
        slug,
        image,
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

export async function deleteCategory(id) {
  try {
    await db.category.delete({
      where: { id },
    })
    revalidatePath('/admin/categories')
    return { message: "Category deleted successfully" }
  } catch (error) {
    return { message: "Failed to delete category" }
  }
}
