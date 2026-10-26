import type { StaticImageData } from "next/image";

export type ProductCategory = "men" | "women" | "accessories";

export interface ProductColor {
  name: string; // e.g. "Black"
  hex: string;  // e.g. "#111111" (used to draw the color swatch)
}

export interface Product {
  id: string;
  slug: string;             // URL-friendly name, e.g. "whitney-shorts"
  name: string;
  subtitle?: string;        // line under the name, e.g. "Coral Red"
  badge?: string;           // label on the image, e.g. "NEW WHITNEY"
  description: string;
  price: number;            // in USD for now (matches the design)
  compareAtPrice?: number;  // optional: the old price, only when on sale
  images: (StaticImageData | string)[]; // imported images or /public paths
  category: ProductCategory;
  collection?: string;      // groups products for carousels, e.g. "lift-seamless-2"
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Look {
  id: string;
  handle: string;                  // creator's social handle, without "@"
  image: StaticImageData | string; // imported image or a /public path
}

// A saved item, with everything the wishlist drawer needs to display it
export interface WishlistItem {
  id: string;        // e.g. "product-5" or "popular-women-running"
  title: string;
  subtitle?: string;
  price?: number;    // collections (Popular Right Now) have no price
  image: StaticImageData | string;
  href: string;
}