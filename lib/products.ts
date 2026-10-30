import { cacheLife, cacheTag } from "next/cache";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product as ProductModel, type ProductDoc } from "@/models/Product";
import type { Product } from "@/types";

// Everything the cards and filters need (the Product type + the extra listing fields)
export type ListingProduct = Product & {
  subcategory?: string;
  collection?: string;
  colorName?: string;
  features?: string[];
  fit?: string;
  pattern?: string;
  discount?: number;
};

type ProductLean = ProductDoc & { _id: Types.ObjectId };

// Turns a database document into the plain object your components already expect
function toProduct(doc: ProductLean): ListingProduct {
  return {
    id: doc._id.toString(), // ObjectId → string
    slug: doc.slug,
    name: doc.name,
    subtitle: doc.subtitle ?? undefined,
    badge: doc.badge ?? undefined,
    description: doc.description,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice ?? undefined,
    discount: doc.discount ?? undefined,
    images: [...doc.images],
    category: doc.category,
    subcategory: doc.subcategory ?? undefined,
    collection: doc.collectionName ?? undefined, // renamed back
    sizes: [...doc.sizes],
    colors: doc.colors.map((color) => ({ name: color.name, hex: color.hex })),
    colorName: doc.colorName ?? undefined,
    features: [...doc.features],
    fit: doc.fit ?? undefined,
    pattern: doc.pattern ?? undefined,
    stock: doc.stock,
    rating: doc.rating ?? 0,
    reviewCount: doc.reviewCount ?? 0,
    isNew: doc.isNewArrival ?? false, // renamed back
    isFeatured: doc.isFeatured ?? false,
  } as ListingProduct;
}

export type ProductFilter = {
  category?: "men" | "women" | "accessories";
  subcategory?: string;
  collection?: string;
  limit?: number;
};

// Many products, optionally filtered. Newest-added last, same order as the old data files.
export async function queryProducts(filter: ProductFilter = {}): Promise<ListingProduct[]> {
  await connectDB();

  const query: Record<string, string> = {};
  if (filter.category) query.category = filter.category;
  if (filter.subcategory) query.subcategory = filter.subcategory;
  if (filter.collection) query.collectionName = filter.collection;

  const docs = await ProductModel.find(query)
    .sort({ _id: 1 })
    .limit(filter.limit ?? 0) // 0 = no limit
    .lean<ProductLean[]>();

  return docs.map(toProduct);
}

// One product by its URL slug, or null if there isn't one
export async function getProductBySlug(slug: string): Promise<ListingProduct | null> {
  await connectDB();
  const doc = await ProductModel.findOne({ slug: slug.toLowerCase() }).lean<ProductLean | null>();
  return doc ? toProduct(doc) : null;
}

// For the carousels on the pages. "use cache" = Next remembers the answer for a few hours,
// so the database isn't asked again on every visit. The "products" tag lets us clear it on demand later.
export async function getCollectionProducts(collection: string): Promise<ListingProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  return queryProducts({ collection });
}

// For the listing pages (All Leggings, Gym Leggings, and the Women / Men subcategory pages).
// Same caching as above.
export async function getSubcategoryProducts(subcategory: string): Promise<ListingProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  return queryProducts({ subcategory });
}

// One product for the /products/[slug] page, remembered like the others.
export async function getCachedProductBySlug(slug: string): Promise<ListingProduct | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  return getProductBySlug(slug);
}

/* ---------- Search + lookup (not cached: every query is different) ---------- */

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Products that contain EVERY word of the query in name, subtitle, description, category,
// collection, badge or colour name
export async function searchProducts(q: string, limit = 40): Promise<ListingProduct[]> {
  const words = q.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  if (words.length === 0) return [];

  await connectDB();

  const docs = await ProductModel.find({
    $and: words.map((word) => {
      // "leggings" also matches "legging", "shorts" matches "short", and so on
      const stem = word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word;
      const rx = new RegExp(escapeRegex(stem), "i");
      return {
        $or: [
          { name: rx },
          { subtitle: rx },
          { description: rx },
          { category: rx },
          { subcategory: rx },
          { collectionName: rx },
          { badge: rx },
          { "colors.name": rx },
        ],
      };
    }),
  })
    .sort({ _id: 1 })
    .limit(limit)
    .lean<ProductLean[]>();

  return docs.map(toProduct);
}

// What to show before the person types: featured products, or just the first few
export async function getPopularProducts(limit = 4): Promise<ListingProduct[]> {
  await connectDB();
  let docs = await ProductModel.find({ isFeatured: true }).sort({ _id: 1 }).limit(limit).lean<ProductLean[]>();
  if (docs.length === 0) {
    docs = await ProductModel.find({ collectionName: { $ne: "section-tiles" } })
      .sort({ _id: 1 })
      .limit(limit)
      .lean<ProductLean[]>();
  }
  return docs.map(toProduct);
}

// Used by the wishlist page to turn saved ids into full products
export async function getProductsByIds(ids: string[]): Promise<ListingProduct[]> {
  const valid = ids.filter((id) => /^[a-f0-9]{24}$/i.test(id)).slice(0, 100);
  if (valid.length === 0) return [];
  await connectDB();
  const docs = await ProductModel.find({ _id: { $in: valid } }).lean<ProductLean[]>();
  return docs.map(toProduct);
}