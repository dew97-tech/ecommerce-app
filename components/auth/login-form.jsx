'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authenticate } from '@/lib/actions'
import Link from 'next/link'
import { useActionState } from 'react'

export function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div aria-live="polite" aria-atomic="true">
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
