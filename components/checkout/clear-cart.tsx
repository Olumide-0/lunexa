"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

// Empties the bag once an order is paid. It waits until the saved bag has loaded
// from the browser, otherwise the saved items would come back afterwards.
export default function ClearCart() {
  useEffect(() => {
    function clear() {
      useCartStore.setState({ items: [] });
    }
    if (useCartStore.persist.hasHydrated()) {
      clear();
      return;
    }
    return useCartStore.persist.onFinishHydration(clear);
  }, []);

  return null;
}