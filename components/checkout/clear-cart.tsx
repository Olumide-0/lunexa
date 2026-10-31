"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

// Runs once an order is paid:
// 1. empties the bag
// 2. removes the products that were just bought from the wishlist
// It waits until the saved bag and wishlist have loaded from the browser,
// otherwise the saved items would come back afterwards.
export default function ClearCart({ productIds }: { productIds: string[] }) {
  const key = productIds.join(",");

  useEffect(() => {
    // Wishlist ids look like "product-<database id>"
    const bought = new Set(key.split(",").filter(Boolean).map((id) => `product-${id}`));

    function clean() {
      if (!useCartStore.persist.hasHydrated() || !useWishlistStore.persist.hasHydrated()) return;
      useCartStore.setState({ items: [] });
      useWishlistStore.setState((state) => ({
        items: state.items.filter((item) => !bought.has(item.id)),
      }));
    }

    clean();
    const stopCart = useCartStore.persist.onFinishHydration(clean);
    const stopWishlist = useWishlistStore.persist.onFinishHydration(clean);
    return () => {
      stopCart();
      stopWishlist();
    };
  }, [key]);

  return null;
}