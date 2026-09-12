import { requireAdmin } from "@/lib/auth/guards"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { saveImageFile } from "@/lib/services/upload"
import { NextResponse } from "next/server"

const SAFE_UPLOAD_ERROR = /too large|maximum size|invalid image|empty|no file/i
const GENERIC_UPLOAD_ERROR =
  "Upload failed. Only JPG, PNG, GIF or WebP images up to 5MB are allowed."

export async function POST(request) {
  let user
  try {
    user = await requireAdmin()
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const limit = checkRateLimit(`upload:admin:${user.id}`, {
    limit: 60,
    windowMs: 60 * 60 * 1000,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many uploads. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "No file provided." }, { status: 400 })
    }

    const url = await saveImageFile(file, "content")

    return NextResponse.json({ url })
  } catch (error) {
    const message = SAFE_UPLOAD_ERROR.test(error.message ?? "")
      ? error.message
      : GENERIC_UPLOAD_ERROR

    return NextResponse.json({ message }, { status: 400 })
  }
}
