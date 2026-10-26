import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StaticImageData } from "next/image";
import type { Product } from "@/types";

export interface CartItem {
  key: string;          // product + size, e.g. "1-M" (same product in 2 sizes = 2 lines)
  productId: string;
  name: string;
  subtitle?: string;
  price: number;
  image: StaticImageData | string;
  href: string;
  size: string;
  quantity: number;
  maxQuantity: number;  // can't add more than what's in stock
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      // Add one of this product in this size, then open the bag
      addItem: (product, size) =>
        set((state) => {
          const key = `${product.id}-${size}`;
          const existing = state.items.find((item) => item.key === key);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.key === key
                  ? { ...item, quantity: Math.min(item.quantity + 1, item.maxQuantity) }
                  : item
              ),
              isOpen: true,
            };
          }

          const newItem: CartItem = {
            key,
            productId: product.id,
            name: product.name,
            subtitle: product.subtitle,
            price: product.price,
            image: product.images[0],
            href: `/products/${product.slug}`,
            size,
            quantity: 1,
            maxQuantity: product.stock,
          };

          return { items: [...state.items, newItem], isOpen: true };
        }),

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((item) => item.key !== key) })),

      // 0 or less removes the line; anything above stock is capped at stock
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.key !== key)
              : state.items.map((item) =>
                  item.key === key
                    ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
                    : item
                ),
        })),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "lunexa-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // don't save whether the drawer is open
      skipHydration: true, // loaded after the page mounts (see navbar)
    }
  )
);

// Total number of items (e.g. 2 shorts + 1 tank = 3)
export const selectCartCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);

// Price of everything in the bag
export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);