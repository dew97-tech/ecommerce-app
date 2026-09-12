import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      phone: true,
      address: true,
    },
  })

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return user
}
