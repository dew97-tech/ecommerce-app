import { CartView } from "@/components/cart/cart-view"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Shopping Cart</h1>
          <p className="text-muted-foreground">Review and manage your items</p>
        </div>
        <CartView />
      </div>
    </div>
  )
}
