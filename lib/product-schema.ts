import { z } from "zod";

// An image is either a file in /public (starts with "/") or one uploaded to Cloudinary
const image = z
  .string()
  .refine((value) => value.startsWith("/") || value.startsWith("https://res.cloudinary.com/"), "Invalid image link");

const optionalText = z.string().trim().max(200).optional();

// What the admin form is allowed to send. Used by both the create and the update API routes.
export const productInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only")
    .refine((value) => value !== "new", "That link name is reserved"),
  name: z.string().trim().min(1, "Name is required").max(120),
  subtitle: optionalText,
  badge: optionalText,
  description: z.string().trim().min(1, "Description is required").max(5000),

  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  discount: z.number().min(0).max(100).optional(),

  images: z.array(image).min(1, "Add at least one image").max(8, "Maximum 8 images"),

  category: z.enum(["men", "women", "accessories"]),
  subcategory: optionalText,
  collectionName: optionalText,

  sizes: z.array(z.string().trim().min(1)).max(20),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Every colour needs a name"),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colour must look like #1A1A1A"),
      })
    )
    .max(20),
  colorName: optionalText,
  features: z.array(z.string().trim().min(1)).max(30),
  fit: optionalText,
  pattern: optionalText,

  stock: z.number().int().min(0),
  isNewArrival: z.boolean(),
  isFeatured: z.boolean(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// Fields that can be empty. When the admin clears one, it is removed from the database.
export const OPTIONAL_KEYS = [
  "subtitle",
  "badge",
  "compareAtPrice",
  "discount",
  "subcategory",
  "collectionName",
  "colorName",
  "fit",
  "pattern",
] as const;

// Turns the form data into a MongoDB update: fields with a value are set, emptied ones are removed
export function toUpdate(data: Omit<ProductInput, "slug">) {
  const $set: Record<string, unknown> = { ...data };
  const $unset: Record<string, ""> = {};

  for (const key of OPTIONAL_KEYS) {
    if ($set[key] === undefined) {
      delete $set[key];
      $unset[key] = "";
    }
  }

  return Object.keys($unset).length > 0 ? { $set, $unset } : { $set };
}