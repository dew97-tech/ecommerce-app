'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile } from '@/lib/profile-actions'
import { useActionState } from 'react'

export function ProfileForm({ user }) {
  const [state, dispatch, isPending] = useActionState(updateProfile, { message: null, errors: {} })

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
            {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={user.phone || ''} placeholder="+880..." />
            {state.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={user.address || ''} placeholder="Your full address..." />
            {state.errors?.address && <p className="text-sm text-red-500">{state.errors.address}</p>}
          </div>

          <div aria-live="polite" aria-atomic="true">
            {state.message && (
              <p className={`text-sm ${state.message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                {state.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
