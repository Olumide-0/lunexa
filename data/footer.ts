// Footer shop columns. Kept here (not inside footer.tsx) so the
// subcategory pages can read the same list and create a page for each link.
export type FooterColumn = {
  title: string;
  basePath: string; // where the links point, e.g. "/women" → /women/gym-leggings
  group?: string; // bold word in the listing sidebar, e.g. "Leggings"
  links: string[];
};

export const shopColumns: FooterColumn[] = [
  {
    title: "Women's Leggings",
    basePath: "/women",
    group: "Leggings",
    links: [
      "Gym Leggings",
      "Leggings With Pockets",
      "High Waisted Leggings",
      "Scrunch Bum Leggings",
      "Black Leggings",
      "Flared Leggings",
      "Seamless Leggings",
      "Petite Gym Leggings",
    ],
  },
  {
    title: "Women's Gymwear",
    basePath: "/women",
    group: "Gymwear",
    links: [
      "Women’s Gym Wear",
      "Women gym Shorts",
      "Running Shorts",
      "Sport Bras",
      "High Impact Sport Bras",
      "Black Sports Bras",
      "Matching Sets",
      "Lounge Wear",
    ],
  },
  {
    title: "Men's Gymwear",
    basePath: "/men",
    group: "Gymwear",
    links: [
      "Men’s Gym Wear",
      "Men Gym shorts",
      "Shorts with Pockets",
      "Men’s Running Shorts",
      "Gym Shirts",
      "Sleeveless T-Shirts",
      "Gym Stringers",
      "Men’s Baselayers",
    ],
  },
  {
    title: "Accessories",
    basePath: "/accessories",
    links: [
      "Women’s Underwear",
      "Men’s Underwear",
      "Workout Bags",
      "Duffel Bags",
      "Gym Socks",
      "Crew Socks",
      "Caps",
      "Beanies",
    ],
  },
];