'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register } from '@/lib/actions'
import Link from 'next/link'
import { useActionState } from 'react'

export function SignupForm() {
  const [state, dispatch, isPending] = useActionState(register, undefined)

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to start shopping.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
            {state?.name && <p className="text-sm text-red-500">{state.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            {state?.email && <p className="text-sm text-red-500">{state.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state?.password && <p className="text-sm text-red-500">{state.password}</p>}
          </div>
          <div aria-live="polite" aria-atomic="true">
             {typeof state === 'string' && <p className="text-sm text-red-500">{state}</p>}
          </div>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
