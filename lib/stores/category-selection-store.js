import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const useCategorySelectionStore = create(
  persist(
    (set) => ({
      selectedIds: [],
      toggleId: (id) => set((state) => {
        const exists = state.selectedIds.includes(id)
        return {
          selectedIds: exists 
            ? state.selectedIds.filter((i) => i !== id)
            : [...state.selectedIds, id]
        }
      }),
      selectIds: (ids) => set((state) => ({
        selectedIds: [...new Set([...state.selectedIds, ...ids])]
      })),
      deselectIds: (ids) => set((state) => ({
        selectedIds: state.selectedIds.filter((id) => !ids.includes(id))
      })),
      clearSelection: () => set({ selectedIds: [] }),
    }),
    {
      name: 'category-selection-storage',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage to clear on tab close
    }
  )
)
