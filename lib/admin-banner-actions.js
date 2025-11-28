'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

import fs from 'node:fs/promises'
import path from 'node:path'

export async function createBanner(prevState, formData) {
  const title = formData.get("title")
  const buttonText = formData.get("buttonText")
  const link = formData.get("link")
  const mode = formData.get("mode")
  
  let imagePath = ''

  try {
    if (mode === 'file') {
        const file = formData.get("imageFile")
        if (!file || file.size === 0) return { message: "No file uploaded." }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        
        // Ensure directory exists
        try {
            await fs.access(uploadDir)
        } catch {
            await fs.mkdir(uploadDir, { recursive: true })
        }

        await fs.writeFile(path.join(uploadDir, filename), buffer)
        imagePath = `/uploads/${filename}`
    } else {
        imagePath = formData.get("imageUrl")
        if (!imagePath) return { message: "Image URL is required" }
    }

    await db.banner.create({
      data: { title, buttonText, image: imagePath, link, isActive: true }
    })
    revalidatePath("/admin/banners")
    return { message: "Banner created successfully." }
  } catch (error) {
    console.error(error)
    return { message: "Failed to create banner." }
  }
}

export async function deleteBanner(id) {
  try {
    await db.banner.delete({ where: { id } })
    revalidatePath("/admin/banners")
    return { message: "Banner deleted." }
  } catch (error) {
    return { message: "Failed to delete banner." }
  }
}

export async function updateBanner(prevState, formData) {
  const id = formData.get("id")
  const title = formData.get("title")
  const buttonText = formData.get("buttonText")
  const link = formData.get("link")
  const mode = formData.get("mode")
  
  let imagePath = ''

  try {
    const dataToUpdate = { title, buttonText, link }

    if (mode === 'file') {
        const file = formData.get("imageFile")
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
            const uploadDir = path.join(process.cwd(), 'public', 'uploads')
            
            try {
                await fs.access(uploadDir)
            } catch {
                await fs.mkdir(uploadDir, { recursive: true })
            }

            await fs.writeFile(path.join(uploadDir, filename), buffer)
            dataToUpdate.image = `/uploads/${filename}`
        }
    } else {
        const imageUrl = formData.get("imageUrl")
        if (imageUrl) {
            dataToUpdate.image = imageUrl
        }
    }

    await db.banner.update({
      where: { id },
      data: dataToUpdate
    })
    revalidatePath("/admin/banners")
    return { message: "Banner updated successfully." }
  } catch (error) {
    console.error(error)
    return { message: "Failed to update banner." }
  }
}
