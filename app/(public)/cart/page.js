import { CartView } from "@/components/cart/cart-view"

export const metadata = {
  title: "Shopping Cart",
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage your items
        </p>
      </div>
      <CartView />
    </div>
  )
}
