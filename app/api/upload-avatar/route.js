import { requireUser } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { saveImageFile } from "@/lib/services/upload"
import { NextResponse } from "next/server"

const SAFE_UPLOAD_ERROR = /too large|maximum size|invalid image|empty|no file/i
const GENERIC_UPLOAD_ERROR =
  "Upload failed. Only JPG, PNG, GIF or WebP images up to 5MB are allowed."

async function getSessionUser() {
  try {
    return await requireUser()
  } catch {
    return null
  }
}

export async function POST(request) {
  const user = await getSessionUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const limit = checkRateLimit(`upload:avatar:${user.id}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    let imageUrl
    try {
      imageUrl = await saveImageFile(file, "avatars")
    } catch (error) {
      const message = SAFE_UPLOAD_ERROR.test(error.message ?? "")
        ? error.message
        : GENERIC_UPLOAD_ERROR

      return NextResponse.json({ error: message }, { status: 400 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
    })

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Profile picture updated successfully"
    })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const user = await getSessionUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await db.user.update({
      where: { id: user.id },
      data: { image: null },
    })

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully"
    })
  } catch (error) {
    console.error("Error removing avatar:", error)
    return NextResponse.json(
      { error: "Failed to remove image" },
      { status: 500 }
    )
  }
}
