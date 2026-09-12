import { auth } from "@/auth"

export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
    role: session.user.role,
  }
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return user
}
