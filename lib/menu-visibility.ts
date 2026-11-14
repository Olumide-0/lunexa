import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";

// The links the admin has hidden. Remembered like the products; the admin clears it on every change.
export async function getHiddenPaths(): Promise<string[]> {
  "use cache";
  cacheLife("days");
  cacheTag("menu-visibility");
  return readHiddenPaths();
}

// Straight from the database (used by the admin page, which must always be up to date)
export async function readHiddenPaths(): Promise<string[]> {
  await connectDB();
  const doc = await SiteSettings.findOne({ key: "main" }).select("hiddenPaths").lean<{ hiddenPaths: string[] } | null>();
  return doc?.hiddenPaths ?? [];
}

// Whole categories that are hidden ("/women" → "women"), so their products stay out of search
const CATEGORIES = ["women", "men", "accessories"] as const;

export async function getHiddenCategories(): Promise<(typeof CATEGORIES)[number][]> {
  const hidden = await getHiddenPaths();
  return CATEGORIES.filter((category) => hidden.includes(`/${category}`));
}