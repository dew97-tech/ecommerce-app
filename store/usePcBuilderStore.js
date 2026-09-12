import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BUILDER_SLOT_KEYS } from "@/lib/pc-builder/slots";

const VALID_SLOT_KEYS = new Set(BUILDER_SLOT_KEYS);

export const usePcBuilderStore = create()(
  persist(
    (set) => ({
      selections: {},

      select: (slotKey, productId) =>
        set((state) => ({
          selections: { ...state.selections, [slotKey]: productId },
        })),

      remove: (slotKey) =>
        set((state) => {
          const nextSelections = { ...state.selections };
          delete nextSelections[slotKey];
          return { selections: nextSelections };
        }),

      setSelections: (selections) =>
        set({ selections: selections && typeof selections === "object" ? selections : {} }),

      clear: () => set({ selections: {} }),
    }),
    {
      name: "pc-builder-v2",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({ selections: state.selections }),
    }
  )
);

export function parseBuildParam(value) {
  if (!value) return null;

  const selections = {};
  for (const entry of String(value).split(",")) {
    const [slotKey, productId] = entry.split(":");
    if (slotKey && productId && VALID_SLOT_KEYS.has(slotKey)) {
      selections[slotKey] = productId;
    }
  }

  return Object.keys(selections).length > 0 ? selections : null;
}

export function buildBuildParam(selections = {}) {
  return Object.entries(selections)
    .filter(([, productId]) => productId)
    .map(([slotKey, productId]) => `${slotKey}:${productId}`)
    .join(",");
}
