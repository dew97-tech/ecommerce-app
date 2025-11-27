'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { placeOrder } from '@/lib/checkout-actions'
import { useCartStore } from '@/store/useCartStore'
import { useActionState, useEffect } from 'react'

export function CheckoutForm() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const clearCart = useCartStore((state) => state.clearCart)
  const [state, dispatch, isPending] = useActionState(placeOrder, { message: null, errors: {} })

  // Need to pass items and total to server action via hidden inputs
  const itemsJson = JSON.stringify(items)
  const totalAmount = total()

  useEffect(() => {
      // Ideally we should clear cart after successful redirect, but since redirect happens on server, 
      // we can't easily clear client store from there. 
      // We'll rely on the OrderSuccess page to clear the cart or just leave it for now.
      // Actually, better to clear it here if we detect success, but we redirect away.
  }, [])

  if (items.length === 0) {
      return <p>Your cart is empty.</p>
  }

  return (
    <form action={dispatch}>
      <input type="hidden" name="items" value={itemsJson} />
      <input type="hidden" name="totalAmount" value={totalAmount} />
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="district">District</Label>
              <Input id="district" name="district" placeholder="Dhaka" required />
              {state.errors?.district && <p className="text-red-500 text-sm">{state.errors.district}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thana">Thana/Area</Label>
              <Input id="thana" name="thana" placeholder="Gulshan" required />
              {state.errors?.thana && <p className="text-red-500 text-sm">{state.errors.thana}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="street">Street Address</Label>
              <Input id="street" name="street" placeholder="House 12, Road 5" required />
              {state.errors?.street && <p className="text-red-500 text-sm">{state.errors.street}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" placeholder="+88017..." defaultValue="+880" required />
              {state.errors?.phone && <p className="text-red-500 text-sm">{state.errors.phone}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>৳ {item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳ {totalAmount}</span>
              </div>
            </CardContent>
          </Card>
          
          <div aria-live="polite" aria-atomic="true">
            {state.message && <p className="text-red-500 text-sm">{state.message}</p>}
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={isPending}>
            {isPending ? 'Placing Order...' : 'Confirm Order (COD)'}
          </Button>
        </div>
      </div>
    </form>
  )
}
