import { auth } from "@/auth"
import { SignupForm } from '@/components/auth/signup-form'
import { redirect } from "next/navigation"

export default async function SignupPage() {
  const session = await auth()
  
  // If user is already logged in, redirect to home
  if (session) {
    redirect('/')
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <SignupForm />
    </div>
  )
}
