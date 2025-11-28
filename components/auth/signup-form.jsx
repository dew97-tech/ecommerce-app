'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register } from '@/lib/actions'
import Link from 'next/link'
import { useActionState } from 'react'

export function SignupForm() {
  const [state, dispatch, isPending] = useActionState(register, undefined)

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Sign Up</h1>
        <p className="text-balance text-muted-foreground">
          Enter your information to create an account
        </p>
      </div>
      <form action={dispatch} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="John Doe" required />
          {state?.name && <p className="text-sm text-red-500">{state.name}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          {state?.email && <p className="text-sm text-red-500">{state.email}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
          {state?.password && <p className="text-sm text-red-500">{state.password}</p>}
        </div>
        <div aria-live="polite" aria-atomic="true">
            {typeof state === 'string' && <p className="text-sm text-red-500">{state}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </div>
    </div>
  )
}
