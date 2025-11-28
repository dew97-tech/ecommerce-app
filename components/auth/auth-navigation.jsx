'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AuthNavigation() {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <div className="absolute right-4 top-4 md:right-8 md:top-8">
      <Button asChild variant="ghost">
        <Link href={isLoginPage ? "/signup" : "/login"}>
          {isLoginPage ? "Sign Up" : "Login"}
        </Link>
      </Button>
    </div>
  )
}
