// A category in the left column of the mega menu (e.g. "Trending").
// Hovering it shows its subcategories in the right column.
export interface MenuCategory {
  title: string;
  subcategories: string[];
  highlight?: boolean; // true = red text (used for "Last Chance")
}

export interface NavMenu {
  label: string;
  href: string;
  categories?: MenuCategory[];
  audiences?: Record<"women" | "men", MenuCategory[]>; // used by the Women/Men toggle (Accessories)
}

const womenCategories: MenuCategory[] = [
  {
    title: "Trending",
    subcategories: [
      "New Product Drops",
      "Best Sellers",
      "Lift Seamless 2.0",
      "White Simmons",
      "Everyday Seamless",
      "Pink Gym Sets",
      "Loungewear",
    ],
  },
  {
    title: "Leggings",
    subcategories: [
      "All Leggings",
      "Gym Leggings",
      "Leggings With Pockets",
      "High Waisted Leggings",
      "Scrunch Bum Leggings",
      "Black Leggings",
    ],
  },
  {
    title: "Products",
    subcategories: [
      "All Products",
      "Leggings",
      "T-shirts & Tops",
      "Sports Bras",
      "Shorts",
      "Hoodies & Sweatshirts",
      "Joggers",
      "Workout Sets",
      "Gym Jackets",
    ],
  },
  {
    title: "Shop by Collection",
    subcategories: [
      "Lift Seamless 2.0",
      "Everyday Seamless",
      "White Simmons",
      "Storm Seamless",
    ],
  },
  {
    title: "Shop by Activity",
    subcategories: ["Lifting", "Training", "Running", "Yoga & Pilates", "Rest Day"],
  },
  {
    title: "Accessories",
    subcategories: ["All Accessories", "Socks", "Bags", "Headwear", "Bottles"],
  },
  {
    title: "Last Chance",
    highlight: true,
    subcategories: ["All Sale", "Leggings Sale", "Tops Sale", "Sports Bras Sale"],
  },
];

const menCategories: MenuCategory[] = [
  {
    title: "Trending",
    subcategories: [
      "New Product Drops",
      "Best Sellers",
      "Devant",
      "Workout Shirts",
      "New In: Shorts",
      "Trending Right Now",
    ],
  },
  {
    title: "Shorts",
    subcategories: [
      "All Shorts",
      "Gym Shorts",
      "Running Shorts",
      "Shorts With Pockets",
      "Black Shorts",
    ],
  },
  {
    title: "Products",
    subcategories: [
      "All Products",
      "T-shirts & Tops",
      "Tank Tops",
      "Shorts",
      "Hoodies & Sweatshirts",
      "Joggers",
      "Track Suits",
      "Gym Jackets",
    ],
  },
  {
    title: "Shop by Collection",
    subcategories: ["Devant", "Workout Shirts", "Power", "Crest"],
  },
  {
    title: "Shop by Activity",
    subcategories: ["Lifting", "Training", "Running", "Rest Day"],
  },
  {
    title: "Accessories",
    subcategories: ["All Accessories", "Socks", "Bags", "Headwear", "Bottles"],
  },
  {
    title: "Last Chance",
    highlight: true,
    subcategories: ["All Sale", "Shorts Sale", "Tops Sale", "Joggers Sale"],
  },
];

const accessoriesCategories: MenuCategory[] = [
  {
    title: "Trending",
    subcategories: ["New Accessories", "Best Sellers", "Gym Essentials"],
  },
  {
    title: "Bags",
    subcategories: ["All Bags", "Backpacks", "Holdalls", "Tote Bags"],
  },
  {
    title: "Socks",
    subcategories: ["All Socks", "Crew Socks", "Ankle Socks", "Trainer Socks"],
  },
  {
    title: "Underwear",
    subcategories: ["All Underwear", "Boxers", "Briefs", "Thongs"],
  },
  {
    title: "Footwear",
    subcategories: ["All Footwear", "Slides", "Trainers"],
  },
  {
    title: "Headwear",
    subcategories: ["All Headwear", "Caps", "Beanies", "Headbands"],
  },
  {
    title: "Equipment",
    subcategories: ["All Equipment", "Bottles", "Lifting Straps", "Resistance Bands"],
  },
];

export const navMenus: NavMenu[] = [
  { label: "Women", href: "/women", categories: womenCategories },
  { label: "Men", href: "/men", categories: menCategories },
  {
    label: "Accessories",
    href: "/accessories",
    audiences: {
      women: accessoriesCategories,
      men: accessoriesCategories,
    },
  },
];