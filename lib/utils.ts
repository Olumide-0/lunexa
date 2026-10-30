import { currencies, useCurrencyStore } from "@/store/currency-store";
import type { Product, WishlistItem } from "@/types";

// Turns "T-shirts & Tops" into "t-shirts-and-tops" so it can be used in a URL
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Takes a USD price and shows it in the currency picked in the top bar.
// e.g. with 1 USD = 1,350 NGN: 40 → "₦54,000"
export function formatPrice(amountInUsd: number): string {
  const { currency: code, rates } = useCurrencyStore.getState();
  const { locale, decimals } = currencies[code];
  const rate = rates[code]; // live rate from the API (or the backup rate)

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(amountInUsd * rate);
}

// Turns a product into the small snapshot the wishlist stores
export function productToWishlistItem(product: Product): WishlistItem {
  return {
    id: `product-${product.id}`,
    title: product.name,
    subtitle: product.subtitle,
    price: product.price,
    image: product.images[0],
    href: `/products/${product.slug}`,
  };
}