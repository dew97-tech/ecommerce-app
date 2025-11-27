import { auth } from "@/auth"
import { LoginForm } from '@/components/auth/login-form'
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await auth()
  
  // If user is already logged in, redirect to home
  if (session) {
    redirect('/')
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <LoginForm />
    </div>
  )
}
