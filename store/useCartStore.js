import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.id === item.id)
        const stockLimit = (item.stock ?? existingItem?.stock) ?? Infinity

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    ...item,
                    quantity: Math.min(i.quantity + item.quantity, stockLimit),
                  }
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
      syncItems: (details, options) => {
        if (!Array.isArray(details)) return { removed: [] }

        const removeMissing = options?.removeMissing !== false
        const byId = new Map(details.map((detail) => [detail.id, detail]))
        const removed = []

        const items = get().items.flatMap((item) => {
          const fresh = byId.get(item.id)

          if (!fresh) {
            if (!removeMissing) return [item]

            removed.push(item.id)
            return []
          }

          const stock = fresh.stock ?? item.stock

          return [
            {
              ...item,
              name: fresh.name,
              slug: fresh.slug,
              image: fresh.image || item.image,
              stock,
              quantity: Math.max(1, Math.min(item.quantity, stock ?? Infinity)),
              ...(item.variant ? {} : { price: fresh.price }),
            },
          ]
        })

        set({ items })
        return { removed }
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
