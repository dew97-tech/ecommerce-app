import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAdminUiStore = create()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (value) =>
        set({ sidebarCollapsed: Boolean(value) }),
    }),
    {
      name: "admin-ui",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);
