// The options shown in the Filters & Sort sidebar on the listing pages
// (same order as the design). Moved here from data/leggings.ts.

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