import { auth } from "@/auth"
import { LoginForm } from '@/components/auth/login-form'
import { redirect } from "next/navigation"

export const metadata = {
  title: "Login",
  description: "Sign in to your RigNexus account to track orders and check out faster.",
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect('/')
  }

  return <LoginForm />
}
