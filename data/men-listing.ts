import type { StaticImageData } from "next/image";
import { slugify } from "@/lib/utils";
import { filterOptions, type LeggingsProduct } from "@/data/leggings";
// Men images already in the project (Workout shirts, Devant, Shorts, Men's bestsellers)
import shirtImage from "../public/images/Frame 7 (4).png";
import devantImage from "../public/images/Frame 7 (36).png";
import shortsImage from "../public/images/Frame 7 (42).png";
import bestsellerImage from "../public/images/Frame 7 (45).png";

/* ---------- Mock men's products for the Men listing pages ---------- */
// Same shape as the leggings products, so the same filters and cards work.
// The backend will replace this later.

interface Template {
  name: string;
  subtitle: string;
  colorName: string;
  hex: string;
  image: StaticImageData;
}

// Placeholder names: change them to the real product names when you have them
const templates: Template[] = [
  { name: "Training T-Shirt", subtitle: "Black", colorName: "Black", hex: "#111111", image: shirtImage },
  { name: "Devant Tank", subtitle: "Grey", colorName: "Grey", hex: "#8A8A8A", image: devantImage },
  { name: "Training Shorts", subtitle: "Black", colorName: "Black", hex: "#111111", image: shortsImage },
  { name: "Essential Oversized Tee", subtitle: "White", colorName: "White", hex: "#F5F5F5", image: bestsellerImage },
];

const prices = [15, 18, 25, 32, 40, 45, 55, 62, 80, 95];
const discounts = [20, 30, 40, 50, 70];

// Picks an item from a list using the product number, so the data is
// varied but always the same on every reload (no Math.random).
function pick<T>(list: readonly T[], index: number, step = 1): T {
  return list[(index * step) % list.length];
}

const TOTAL_PRODUCTS = 96;

export const menListingProducts: LeggingsProduct[] = Array.from(
  { length: TOTAL_PRODUCTS },
  (_, i) => {
    const template = templates[i % templates.length];
    const number = i + 1;
    const discount = i % 3 === 0 ? pick(discounts, i, 7) : undefined;
    const price = pick(prices, i, 3);

    return {
      id: `men-listing-${number}`,
      slug: `men-${slugify(template.name)}-${number}`,
      name: template.name,
      subtitle: template.subtitle,
      badge: i % 2 === 0 ? "New" : undefined,
      description: `${template.name} in ${template.subtitle}.`,
      price,
      compareAtPrice: discount ? Math.round(price / (1 - discount / 100)) : undefined,
      images: [template.image],
      category: "men",
      collection: pick(filterOptions.collections, i, 3),
      sizes: [
        pick(filterOptions.size, i),
        pick(filterOptions.size, i + 2),
        pick(filterOptions.size, i + 4),
      ],
      colors: [{ name: template.subtitle, hex: template.hex }],
      stock: 10 + (i % 25),
      rating: 4 + (i % 10) / 10,
      reviewCount: 10 + ((i * 13) % 90),
      isNew: i % 2 === 0,
      colorName: template.colorName,
      features: [pick(filterOptions.features, i), pick(filterOptions.features, i, 5)],
      fit: pick(filterOptions.fit, i, 2),
      pattern: pick(filterOptions.patterns, i, 3),
      discount,
    };
  }
);