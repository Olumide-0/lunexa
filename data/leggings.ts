import type { StaticImageData } from "next/image";
import type { Product } from "@/types";
import { slugify } from "@/lib/utils";
// Placeholders: replace with the 4 card photos from the design when you send them
import shortsImage from "../public/images/Frame 7 (1).png";
import flaredImage from "../public/images/Frame 7 (2).png";
import blueBraImage from "../public/images/Frame 7 (3).png";
import pinkBraImage from "../public/images/image 25.png";

// A leggings product has everything a normal Product has, plus the extra
// fields the Filters & Sort sidebar needs.
export interface LeggingsProduct extends Product {
  colorName: string;
  features: string[];
  fit: string;
  pattern: string;
  discount?: number; // percentage off, e.g. 20 = 20% off
}

// The options shown in each sidebar section (same order as the design)
export const sortOptions = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "relevancy", label: "Price: Relevancy" },
  { value: "newest", label: "Price: Newest" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];

export const filterOptions = {
  size: ["XS", "Small", "Medium", "Large", "X-Large", "XX-Large", "No Size", "M/L", "S/M"],
  features: [
    "Seamless",
    "Sweat Wicking",
    "Breathable",
    "Bum Scrunch",
    "Light Weight",
    "Pockets",
    "Reflective Branding",
    "Adjustable Waistbands",
  ],
  fit: ["Body Fit", "Regular", "Short", "Tall", "Slim Fit"],
  collections: [
    "Vitals",
    "Reps",
    "Lx X Whitney",
    "Adapt",
    "Elevate",
    "Everyday",
    "Legacy",
    "Lunexa Power",
    "Adapt Fleck",
    "Gym-kit",
  ],
  color: ["Black", "Blue", "Brown", "Green", "Grey", "Pink", "Purple", "Red", "White", "Teal"],
  patterns: ["Abstract", "Animal", "Camo", "Fleck"],
  discount: ["20%", "30%", "40%", "50%", "70%"],
  price: ["$10-$20", "$20-$39", "$30-$50", "$50-$70", "$75-$100"],
};

export type FilterKey = keyof typeof filterOptions;

/* ---------- Mock products (the backend will replace this later) ---------- */

interface Template {
  name: string;
  subtitle: string;
  colorName: string;
  hex: string;
  image: StaticImageData;
}

// The 4 cards that repeat in the design
const templates: Template[] = [
  { name: "Whitney Shorts", subtitle: "Coral Red", colorName: "Red", hex: "#F25C54", image: shortsImage },
  { name: "Whitney Flared Leggings", subtitle: "Regular Depth Brown", colorName: "Brown", hex: "#4A2C21", image: flaredImage },
  { name: "Minimal Halterneck Sports Bra", subtitle: "Electric Blue", colorName: "Blue", hex: "#1E90D6", image: blueBraImage },
  { name: "Whitney Sports Bra", subtitle: "Lilac Pink", colorName: "Pink", hex: "#E7A6E0", image: pinkBraImage },
];

const prices = [15, 18, 25, 32, 40, 45, 55, 62, 80, 95];
const discounts = [20, 30, 40, 50, 70];

// Picks an item from a list using the product number, so the data is
// varied but always the same on every reload (no Math.random).
function pick<T>(list: readonly T[], index: number, step = 1): T {
  return list[(index * step) % list.length];
}

const TOTAL_PRODUCTS = 118;

export const leggingsProducts: LeggingsProduct[] = Array.from(
  { length: TOTAL_PRODUCTS },
  (_, i) => {
    const template = templates[i % templates.length];
    const number = i + 1;
    const discount = i % 3 === 0 ? pick(discounts, i, 7) : undefined;
    const price = pick(prices, i, 3);

    return {
      id: `leggings-${number}`,
      slug: `${slugify(template.name)}-${number}`,
      name: template.name,
      subtitle: template.subtitle,
      badge: "New Whitney",
      description: `${template.name} in ${template.subtitle}.`,
      price,
      compareAtPrice: discount ? Math.round(price / (1 - discount / 100)) : undefined,
      images: [template.image],
      category: "women",
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