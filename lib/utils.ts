import type { Product, WishlistItem } from "@/types";

// Turns "T-shirts & Tops" into "t-shirts-and-tops" so it can be used in a URL
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// 40 → "$40", 40.5 → "$40.50"
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Converts a product into the snapshot the wishlist saves
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