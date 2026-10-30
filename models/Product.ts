import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// A colour swatch. { _id: false } = don't give each swatch its own id
const colorSchema = new Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true }, // used in the URL
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    badge: { type: String, trim: true },
    description: { type: String, required: true },

    price: { type: Number, required: true, min: 0 }, // USD, same as the design
    compareAtPrice: { type: Number, min: 0 }, // the old price, only when on sale
    discount: { type: Number, min: 0, max: 100 }, // % off

    images: {
      type: [String],
      required: true,
      validate: { validator: (value: string[]) => value.length > 0, message: "A product needs at least one image" },
    },

    category: { type: String, required: true, enum: ["men", "women", "accessories"], index: true },
    subcategory: { type: String, index: true }, // e.g. "leggings"; tells the listing pages which products belong to them
    // NOT called "collection" or "isNew": Mongoose reserves those names. lib/products.ts converts them back.
    collectionName: { type: String, index: true }, // e.g. "lift-seamless-2" (carousel sections) or "Vitals" (filter)

    sizes: { type: [String], default: [] },
    colors: { type: [colorSchema], default: [] },
    colorName: { type: String }, // the colour FILTER (Black, Blue...)
    features: { type: [String], default: [] },
    fit: { type: String },
    pattern: { type: String },

    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const Product =
  (models.Product as Model<ProductDoc>) || model<ProductDoc>("Product", productSchema);