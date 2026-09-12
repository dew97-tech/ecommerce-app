import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.id === item.id)
        const stockLimit = (existingItem?.stock ?? item.stock) ?? Infinity

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, stockLimit) }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...currentItems,
              { ...item, quantity: Math.min(item.quantity, item.stock ?? Infinity) },
            ],
          })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      updateQuantity: (id, quantity) => {
        const item = get().items.find((i) => i.id === id)
        const stockLimit = item?.stock ?? Infinity
        const clampedQuantity = Math.max(1, Math.min(quantity, stockLimit))

        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: clampedQuantity } : i
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      total: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
      version: 2,
    }
  )
)
