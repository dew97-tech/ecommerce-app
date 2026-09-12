import { auth } from "@/auth"
import { SignupForm } from '@/components/auth/signup-form'
import { redirect } from "next/navigation"

export const metadata = {
  title: "Create Account",
  description: "Create a RigNexus account to order computer parts, laptops and gear.",
  robots: { index: false, follow: false },
}

export default async function SignupPage() {
  const session = await auth()

  if (session) {
    redirect('/')
  }

  return <SignupForm />
}
