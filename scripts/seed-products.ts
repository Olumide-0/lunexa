import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

/* ---------- Copied from data/leggings.ts (it can't be imported here because of the image imports) ---------- */
const sizeOptions = ["XS", "Small", "Medium", "Large", "X-Large", "XX-Large", "No Size", "M/L", "S/M"];
const featureOptions = [
  "Seamless", "Sweat Wicking", "Breathable", "Bum Scrunch",
  "Light Weight", "Pockets", "Reflective Branding", "Adjustable Waistbands",
];
const fitOptions = ["Body Fit", "Regular", "Short", "Tall", "Slim Fit"];
const collectionOptions = [
  "Vitals", "Reps", "Lx X Whitney", "Adapt", "Elevate",
  "Everyday", "Legacy", "Lunexa Power", "Adapt Fleck", "Gym-kit",
];
const patternOptions = ["Abstract", "Animal", "Camo", "Fleck"];
const prices = [15, 18, 25, 32, 40, 45, 55, 62, 80, 95];
const discounts = [20, 30, 40, 50, 70];

function pick<T>(list: readonly T[], index: number, step = 1): T {
  return list[(index * step) % list.length];
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Images become plain paths into public/images (spaces and brackets encoded)
const img = (file: string) => encodeURI(`/images/${file}`);

interface Template {
  name: string;
  subtitle: string;
  colorName: string;
  hex: string;
  image: string;
}

const womenTemplates: Template[] = [
  { name: "Whitney Shorts", subtitle: "Coral Red", colorName: "Red", hex: "#F25C54", image: img("Frame 7 (1).png") },
  { name: "Whitney Flared Leggings", subtitle: "Regular Depth Brown", colorName: "Brown", hex: "#4A2C21", image: img("Frame 7 (2).png") },
  { name: "Minimal Halterneck Sports Bra", subtitle: "Electric Blue", colorName: "Blue", hex: "#1E90D6", image: img("Frame 7 (3).png") },
  { name: "Whitney Sports Bra", subtitle: "Lilac Pink", colorName: "Pink", hex: "#E7A6E0", image: img("image 25.png") },
];

const menTemplates: Template[] = [
  { name: "Training T-Shirt", subtitle: "Black", colorName: "Black", hex: "#111111", image: img("Frame 7 (4).png") },
  { name: "Devant Tank", subtitle: "Grey", colorName: "Grey", hex: "#8A8A8A", image: img("Frame 7 (36).png") },
  { name: "Training Shorts", subtitle: "Black", colorName: "Black", hex: "#111111", image: img("Frame 7 (42).png") },
  { name: "Essential Oversized Tee", subtitle: "White", colorName: "White", hex: "#F5F5F5", image: img("Frame 7 (45).png") },
];

/* ---------- Builds the mock listing products (same maths as the old data files) ---------- */
function buildListing(options: {
  count: number;
  templates: Template[];
  category: "men" | "women";
  subcategory: string;
  slugPrefix: string;
  badge: (i: number) => string | undefined;
}) {
  return Array.from({ length: options.count }, (_, i) => {
    const template = options.templates[i % options.templates.length];
    const number = i + 1;
    const discount = i % 3 === 0 ? pick(discounts, i, 7) : undefined;
    const price = pick(prices, i, 3);

    return {
      slug: `${options.slugPrefix}${slugify(template.name)}-${number}`,
      name: template.name,
      subtitle: template.subtitle,
      badge: options.badge(i),
      description: `${template.name} in ${template.subtitle}.`,
      price,
      compareAtPrice: discount ? Math.round(price / (1 - discount / 100)) : undefined,
      discount,
      images: [template.image],
      category: options.category,
      subcategory: options.subcategory,
      collectionName: pick(collectionOptions, i, 3),
      sizes: [pick(sizeOptions, i), pick(sizeOptions, i + 2), pick(sizeOptions, i + 4)],
      colors: [{ name: template.subtitle, hex: template.hex }],
      colorName: template.colorName,
      features: [pick(featureOptions, i), pick(featureOptions, i, 5)],
      fit: pick(fitOptions, i, 2),
      pattern: pick(patternOptions, i, 3),
      stock: 10 + (i % 25),
      rating: 4 + (i % 10) / 10,
      reviewCount: 10 + ((i * 13) % 90),
      isNewArrival: i % 2 === 0,
    };
  });
}

/* ---------- The 32 carousel products from data/products.ts, as a table ---------- */
const allSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const TANK = "Versatile Seamless Tank";
const BROWN: [string, string] = ["Regular Depth Brown", "#4A2C21"];

// Each row: [slug, name, subtitle, badge, description, image number, collection, category, [colour name, hex], stock, rating, reviewCount, isNew]
type CarouselRow = [
  string, string, string, string | undefined, string, number, string,
  "men" | "women", [string, string], number, number, number, boolean
];

const D_BRA = "A light-support halterneck bra for low-impact training.";
const D_TANK = "A breathable seamless tank built for training and everyday wear.";
const D_TOP = "A breathable seamless top built for training and everyday wear.";
const D_LIFT = "Sculpting, shaping seamless leggings with a mid-rise waist.";
const D_EVERYDAY = "Soft, second-skin seamless training wear.";
const D_DEVANT = "The original Devant silhouette and fit, back for good.";
const D_SHORTS = "Lightweight shorts for training, running and everything in between.";
const D_JOGGERS = "Relaxed-fit joggers for rest days and everything in between.";

const carouselRows: CarouselRow[] = [
  // White Simmons (women)
  ["whitney-shorts", "Whitney Shorts", "Coral Red", "New Whitney", "High-waisted, squat-proof shorts in our signature Whitney fabric.", 1, "white-simmons", "women", ["Coral Red", "#F25C54"], 30, 4.7, 52, true],
  ["whitney-flared-leggings", "Whitney Flared Leggings", "Regular Depth Brown", "New Whitney", "Flared leggings with a sculpting high waist.", 2, "white-simmons", "women", BROWN, 24, 4.6, 41, true],
  ["minimal-halterneck-sports-bra", "Minimal Halterneck Sports Bra", "Light Support", "New Whitney", D_BRA, 3, "white-simmons", "women", ["Blue", "#1E90D6"], 18, 4.8, 33, true],
  ["minimal-halterneck-sports-bra-light", "Minimal Halterneck Sports Bra", "Light Support", "New Whitney", D_BRA, 3, "white-simmons", "women", ["Blue", "#1E90D6"], 18, 4.8, 33, true],

  // Workout Shirts (men)
  ["versatile-seamless-tank-light-grey", TANK, "Light Grey/ Smokey Grey", "New", D_TANK, 4, "workout-shirts", "men", ["Light Grey/ Smokey Grey", "#C9CACC"], 40, 4.5, 27, true],
  ["versatile-seamless-tank-iron-blue", TANK, "Iron Blue/Navy", "New", D_TANK, 5, "workout-shirts", "men", ["Iron Blue/Navy", "#4A6283"], 35, 4.6, 19, true],
  ["versatile-seamless-tank-dark-grey", TANK, "Dark Grey/Black", "New", D_TANK, 6, "workout-shirts", "men", ["Dark Grey/Black", "#3A3B3E"], 28, 4.7, 22, true],
  ["versatile-seamless-tank-rust", TANK, "Rust", "New", D_TANK, 4, "workout-shirts", "men", ["Rust", "#A0522D"], 22, 4.4, 14, true],

  // New In: Lift Seamless 2.0 (women)
  ["lift-seamless-2-mid-rise-leggings", "Lift Seamless 2.0 Mid-Rise Leggings", "Midnight Navy", "New", D_LIFT, 19, "lift-seamless-2", "women", ["Midnight Navy", "#2E2B6E"], 30, 4.7, 18, true],
  ["lift-seamless-2-mid-rise-shorts", "Lift Seamless 2.0 Mid-Rise Shorts", "Midnight Navy", "New", D_LIFT, 20, "lift-seamless-2", "women", ["Midnight Navy", "#2E2B6E"], 26, 4.6, 12, true],
  ["lift-seamless-2-crop-top", "Lift Seamless 2.0 Crop Top", "Midnight Navy", "New", D_LIFT, 21, "lift-seamless-2", "women", ["Midnight Navy", "#2E2B6E"], 22, 4.8, 9, true],
  ["lift-seamless-2-mid-rise-leggings-navy", "Lift Seamless 2.0 Mid-Rise Leggings", "Midnight Navy", "New", D_LIFT, 19, "lift-seamless-2", "women", ["Midnight Navy", "#2E2B6E"], 20, 4.5, 7, true],

  // New In: Everyday Seamless (women)
  ["everyday-seamless-long-sleeve-crop-top", "Everyday Seamless Long Sleeve Crop Top", BROWN[0], "New", D_EVERYDAY, 22, "everyday-seamless", "women", BROWN, 30, 4.6, 11, true],
  ["everyday-seamless-tank", "Everyday Seamless Tank", "Slate Grey", "New", D_EVERYDAY, 23, "everyday-seamless", "women", ["Slate Grey", "#4A5058"], 28, 4.7, 8, true],
  ["everyday-seamless-zip-jacket", "Everyday Seamless Zip Jacket", "Cream", "New", D_EVERYDAY, 24, "everyday-seamless", "women", ["Cream", "#F3EFE6"], 24, 4.5, 6, true],
  ["everyday-seamless-shorts", "Everyday Seamless Shorts", BROWN[0], "New", D_EVERYDAY, 22, "everyday-seamless", "women", BROWN, 20, 4.4, 5, true],

  // Top 10 Women's Bestsellers
  ["womens-versatile-seamless-tank-light-grey", TANK, "Light Grey/ Smokey Grey", "New", D_TOP, 30, "women-bestsellers", "women", ["Light Grey/ Smokey Grey", "#C9CACC"], 40, 4.8, 120, true],
  ["womens-versatile-seamless-tank-iron-blue", TANK, "Iron Blue/Navy", "New", D_TOP, 31, "women-bestsellers", "women", ["Iron Blue/Navy", "#4A6283"], 36, 4.7, 98, true],
  ["womens-versatile-seamless-tank-dark-grey", TANK, "Dark Grey/Black", "New", D_TOP, 32, "women-bestsellers", "women", ["Dark Grey/Black", "#3A3B3E"], 32, 4.7, 87, true],
  ["womens-versatile-seamless-tank-rust", TANK, "Rust", "New", D_TOP, 30, "women-bestsellers", "women", ["Rust", "#A0522D"], 28, 4.6, 64, true],

  // Devant Just Dropped (men)
  ["devant-seamless-tank", "Devant Seamless Tank", BROWN[0], "New", D_DEVANT, 36, "devant", "men", BROWN, 30, 4.8, 21, true],
  ["devant-seamless-t-shirt", "Devant Seamless T-Shirt", BROWN[0], "New", D_DEVANT, 37, "devant", "men", BROWN, 28, 4.7, 17, true],
  ["devant-seamless-long-sleeve", "Devant Seamless Long Sleeve", BROWN[0], "New", D_DEVANT, 38, "devant", "men", BROWN, 24, 4.7, 13, true],
  ["devant-seamless-shorts", "Devant Seamless Shorts", BROWN[0], "New", D_DEVANT, 36, "devant", "men", BROWN, 20, 4.6, 9, true],

  // New In: Shorts (men)
  ["mens-running-shorts-black", "Running Shorts", "Black", "New", D_SHORTS, 42, "men-shorts", "men", ["Black", "#111111"], 30, 4.6, 15, true],
  ["mens-2-in-1-shorts-black", "2-in-1 Shorts", "Black", "New", D_SHORTS, 43, "men-shorts", "men", ["Black", "#111111"], 28, 4.7, 12, true],
  ["mens-training-shorts-black", "Training Shorts", "Black", "New", D_SHORTS, 44, "men-shorts", "men", ["Black", "#111111"], 24, 4.5, 10, true],
  ["mens-gym-shorts-black", "Gym Shorts", "Black", "New", D_SHORTS, 42, "men-shorts", "men", ["Black", "#111111"], 20, 4.4, 8, true],

  // Top 10 Men's Bestsellers (no badge, not "new")
  ["mens-relaxed-joggers-brown", "Relaxed Joggers", BROWN[0], undefined, D_JOGGERS, 45, "men-bestsellers", "men", BROWN, 40, 4.8, 110, false],
  ["mens-relaxed-joggers-black", "Relaxed Joggers", "Black", undefined, D_JOGGERS, 46, "men-bestsellers", "men", ["Black", "#111111"], 36, 4.7, 94, false],
  ["mens-track-pants-black", "Track Pants", "Black", undefined, D_JOGGERS, 47, "men-bestsellers", "men", ["Black", "#111111"], 32, 4.7, 81, false],
  ["mens-relaxed-joggers-grey", "Relaxed Joggers", "Grey", undefined, D_JOGGERS, 45, "men-bestsellers", "men", ["Grey", "#8A8D91"], 28, 4.6, 66, false],
];

/* ---------- The section tiles (Hot Right Now, How do you train, Trending, Popular, Women's Favorites) ----------
   They were mock cards inside the components. Now each one is a real product, so its page exists at /products/<slug>.
   Placeholder price and stock, same as the old mock (price 40, stock 20). */
type TileRow = [string, string, string, number, "men" | "women"]; // [slug, name, description, image number, category]
const tileRows: TileRow[] = [
  ["popular-women-athleisure", "Athleisure looks just landed", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 7, "women"],
  ["popular-women-running", "Running", "Running stuff so good it’ll (almost) make you want to do cardio.", 8, "women"],
  ["popular-women-sports-bras", "Sports bras", "Lifting, running, yoga-ing... Whatever you’re up to, pick a sports bra that moves with you.", 9, "women"],
  ["popular-women-pink", "Pink", "Replace with the real description from the design.", 7, "women"],
  ["popular-men-athleisure", "Athleisure looks just landed", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 4, "men"],
  ["popular-men-running", "Running", "Running stuff so good it’ll (almost) make you want to do cardio.", 5, "men"],
  ["popular-men-t-shirts", "T-shirts & tops", "Replace with the real description from the design.", 6, "men"],
  ["popular-men-shorts", "Shorts", "Replace with the real description from the design.", 4, "men"],
  ["train-women-lifting", "Lifting", "Lifting", 10, "women"],
  ["train-women-running", "Running", "Running", 11, "women"],
  ["train-women-pilates", "Pilates", "Pilates", 12, "women"],
  ["train-women-hiit", "HIIT", "HIIT", 10, "women"],
  ["train-men-lifting", "Lifting", "Lifting", 13, "men"],
  ["train-men-running", "Running", "Running", 14, "men"],
  ["train-men-pilates", "Pilates", "Pilates", 15, "men"],
  ["train-men-hiit", "HIIT", "HIIT", 13, "men"],
  ["women-train-athleisure", "Athleisure looks just landed", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 33, "women"],
  ["women-train-running", "Running", "Running stuff so good it’ll (almost) make you want to do cardio.", 34, "women"],
  ["women-train-sports-bras", "Sports bras", "Lifting, running, yoga-ing... Whatever you’re up to, pick a sports bra that moves with you.", 35, "women"],
  ["women-train-placeholder", "Women’s training essentials", "Replace with the real description from the design.", 33, "women"],
  ["women-favorite-leggings", "Leggings", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 25, "women"],
  ["women-favorite-sports-bras", "Sports bras", "Running stuff so good it’ll (almost) make you want to do cardio.", 26, "women"],
  ["women-favorite-shorts", "Shorts", "Lifting, running, yoga-ing... Whatever you’re up to, pick a sports bra that moves with you.", 27, "women"],
  ["women-favorite-t-shirts", "T-shirts", "Replace with the real description from the design.", 25, "women"],
  ["men-trending-summer-bestsellers", "Summer bestsellers", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 39, "men"],
  ["men-trending-new-shorts", "New shorts just landed", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 40, "men"],
  ["men-trending-for-every-run", "For every run", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 41, "men"],
  ["men-trending-placeholder", "Men’s trending essentials", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 39, "men"],
  ["men-train-running", "Running", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 49, "men"],
  ["men-train-lifting", "Lifting", "Running stuff so good it’ll (almost) make you want to do cardio.", 50, "men"],
  ["men-train-hits", "Hits", "Lifting, running, yoga-ing... Whatever you’re up to, pick a sports bra that moves with you.", 51, "men"],
  ["men-train-placeholder", "Men’s training essentials", "Replace with the real description from the design.", 49, "men"],
  ["women-hot-summer-best-sellers", "Summer best-sellers", "Comfy styles to layer up or down with. Either way, you’ll be wearing them.", 28, "women"],
  ["women-hot-for-every-run", "For every run", "Running stuff so good it’ll (almost) make you want to do cardio.", 8, "women"],
  ["women-hot-get-em-in-pink", "Get ’em in pink", "Lifting, running, yoga-ing... Whatever you’re up to, pick a sports bra that moves with you.", 29, "women"],
  ["women-hot-everyday", "Everyday seamless", "Replace with the real description from the design.", 28, "women"],
];

async function seed() {
  // 1. The carousel products (the old "id" isn't needed; MongoDB makes its own)
  const carousel = carouselRows.map(
    ([slug, name, subtitle, badge, description, imageNumber, collection, category, [colorName, hex], stock, rating, reviewCount, isNew]) => ({
      slug,
      name,
      subtitle,
      badge,
      description,
      price: 40,
      images: [img(`Frame 7 (${imageNumber}).png`)],
      category,
      collectionName: collection,
      sizes: allSizes,
      colors: [{ name: colorName, hex }],
      stock,
      rating,
      reviewCount,
      isNewArrival: isNew,
    })
  );

  // 2. The 118 women's leggings listing products
  const leggings = buildListing({
    count: 118,
    templates: womenTemplates,
    category: "women",
    subcategory: "leggings",
    slugPrefix: "",
    badge: () => "New Whitney",
  });

  // 3. The 96 men's listing products
  const menListing = buildListing({
    count: 96,
    templates: menTemplates,
    category: "men",
    subcategory: "men-listing",
    slugPrefix: "men-",
    badge: (i) => (i % 2 === 0 ? "New" : undefined),
  });

  // 4. The section tiles, as real products (no subcategory or collection, so they never show in listings or carousels)
  const tiles = tileRows.map(([slug, name, description, imageNumber, category]) => ({
    slug,
    name,
    subtitle: category === "women" ? "Women" : "Men",
    description,
    price: 40,
    images: [img(`Frame 7 (${imageNumber}).png`)],
    category,
    collectionName: "section-tiles",
    sizes: allSizes,
    colors: [],
    stock: 20,
    rating: 0,
    reviewCount: 0,
  }));

  const all = [...carousel, ...leggings, ...menListing, ...tiles];

  await connectDB();
  await Product.deleteMany({}); // start clean, so you can run this again safely
  await Product.insertMany(all);

  console.log(`✅ Seeded ${all.length} products (${carousel.length} carousel, ${leggings.length} leggings, ${menListing.length} men, ${tiles.length} tiles)`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("❌ Seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});