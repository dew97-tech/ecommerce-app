import { auth } from "@/auth"
import { ProfileForm } from "@/components/profile/profile-form"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "My Profile",
  robots: { index: false, follow: false },
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, phone: true, address: true },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
      <ProfileForm user={user} />
    </div>
  )
}
