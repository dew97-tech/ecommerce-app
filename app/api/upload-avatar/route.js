import { auth } from "@/auth"
import { db } from "@/lib/db"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { NextResponse } from "next/server"
import path from "path"

export async function POST(request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileExtension = file.name.split(".").pop()
    const fileName = `${session.user.id}-${Date.now()}.${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Write file
    await writeFile(filePath, buffer)

    // Update user in database
    const imageUrl = `/uploads/avatars/${fileName}`
    await db.user.update({
      where: { id: session.user.id },
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
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Remove avatar from database
    await db.user.update({
      where: { id: session.user.id },
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
