import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePcBuilderStore = create(
  persist(
    (set, get) => ({
      components: {}, // { cpu: product, gpu: product, ... }
      totalPrice: 0,

      addComponent: (type, product) => {
        const currentComponents = get().components
        const oldProduct = currentComponents[type]
        
        const newPrice = Number(product.price) || 0
        const oldPrice = oldProduct ? (Number(oldProduct.price) || 0) : 0
        const priceDiff = newPrice - oldPrice

        set((state) => ({
          components: { ...state.components, [type]: product },
          totalPrice: (state.totalPrice || 0) + priceDiff
        }))
      },

      removeComponent: (type) => {
        const currentComponents = get().components
        const productToRemove = currentComponents[type]

        if (!productToRemove) return

        const newComponents = { ...currentComponents }
        delete newComponents[type]
        
        const priceToRemove = Number(productToRemove.price) || 0

        set((state) => ({
          components: newComponents,
          totalPrice: Math.max(0, (state.totalPrice || 0) - priceToRemove)
        }))
      },

      clearBuild: () => set({ components: {}, totalPrice: 0 }),
    }),
    {
      name: 'pc-builder-storage',
    }
  )
)
