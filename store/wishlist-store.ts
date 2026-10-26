import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { WishlistItem } from "@/types";

type WishlistPopup = "card" | "navbar" | null;

interface WishlistState {
  items: WishlistItem[];
  popup: WishlistPopup; // which wishlist popup is open, if any
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  openPopup: (popup: "card" | "navbar") => void;
  closePopup: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      popup: null,

      // Save if not saved yet, remove if already saved
      toggleItem: (item) =>
        set((state) => ({
          items: state.items.some((saved) => saved.id === item.id)
            ? state.items.filter((saved) => saved.id !== item.id)
            : [...state.items, item],
        })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((saved) => saved.id !== id) })),

      clearItems: () => set({ items: [] }),

      openPopup: (popup) => set({ popup }),
      closePopup: () => set({ popup: null }),
    }),
    {
      name: "lunexa-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // only save items, not the popup
      skipHydration: true, // we load saved items ourselves after the page mounts
      version: 1,
      migrate: () => ({ items: [] }), // old saved format (ids only) is cleared
    }
  )
);