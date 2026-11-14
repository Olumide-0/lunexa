import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// One document (key "main") for store-wide settings that the admin can change.
// hiddenPaths: menu links hidden from the store, e.g. "/women/leggings" or "/accessories".
const siteSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    hiddenPaths: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;
export const SiteSettings =
  (models.SiteSettings as Model<SiteSettingsDoc>) || model<SiteSettingsDoc>("SiteSettings", siteSettingsSchema);