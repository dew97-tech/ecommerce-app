'use server'

import { requireAdmin } from "@/lib/auth/guards"
import { CACHE_TAGS } from "@/lib/cache/config"
import { db } from "@/lib/db"
import { saveImageFile } from "@/lib/services/upload"
import { revalidatePath, revalidateTag } from "next/cache"

function revalidateBanners() {
  revalidateTag(CACHE_TAGS.banners, "max")
}

async function resolvePrimaryImage(formData) {
  const file = formData.get("imageFile")
  if (file && typeof file !== "string" && file.size > 0) {
    return saveImageFile(file)
  }

  const url = formData.get("imageUrl")
  if (typeof url === "string" && url.trim()) {
    return url.trim()
  }

  return null
}

async function resolveMobileImage(formData) {
  const file = formData.get("imageMobileFile")
  if (file && typeof file !== "string" && file.size > 0) {
    return saveImageFile(file)
  }

  const url = formData.get("imageMobileUrl")
  if (typeof url === "string" && url.trim()) {
    return url.trim()
  }

  return null
}

export async function createBanner(prevState, formData) {
  await requireAdmin()

  const title = formData.get("title")
  const buttonText = formData.get("buttonText")
  const link = formData.get("link")

  try {
    const imagePath = await resolvePrimaryImage(formData)
    if (!imagePath) {
      return { message: "A desktop image is required (URL or upload)." }
    }

    const imageMobile = await resolveMobileImage(formData)

    await db.banner.create({
      data: { title, buttonText, image: imagePath, imageMobile, link, isActive: true },
    })
    revalidatePath("/admin/banners")
    revalidatePath("/")
    revalidateBanners()
    return { message: "Banner created successfully." }
  } catch (error) {
    console.error(error)
    return { message: error.message || "Failed to create banner." }
  }
}

export async function deleteBanner(id) {
  await requireAdmin()

  try {
    await db.banner.delete({ where: { id } })
    revalidatePath("/admin/banners")
    revalidatePath("/")
    revalidateBanners()
    return { message: "Banner deleted." }
  } catch (error) {
    return { message: "Failed to delete banner." }
  }
}

export async function updateBanner(prevState, formData) {
  await requireAdmin()

  const id = formData.get("id")
  const title = formData.get("title")
  const buttonText = formData.get("buttonText")
  const link = formData.get("link")

  try {
    const dataToUpdate = { title, buttonText, link }

    const imagePath = await resolvePrimaryImage(formData)
    if (imagePath) {
      dataToUpdate.image = imagePath
    }

    const imageMobile = await resolveMobileImage(formData)
    if (imageMobile) {
      dataToUpdate.imageMobile = imageMobile
    }

    await db.banner.update({
      where: { id },
      data: dataToUpdate,
    })
    revalidatePath("/admin/banners")
    revalidatePath("/")
    revalidateBanners()
    return { message: "Banner updated successfully." }
  } catch (error) {
    console.error(error)
    return { message: error.message || "Failed to update banner." }
  }
}

export async function setBannerActive(id, isActive) {
  await requireAdmin()

  try {
    await db.banner.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    })
    revalidatePath("/admin/banners")
    revalidatePath("/")
    revalidateBanners()
    return { message: isActive ? "Banner activated." : "Banner hidden." }
  } catch (error) {
    console.error(error)
    return { message: "Failed to update banner status." }
  }
}
