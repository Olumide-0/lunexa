import type { Metadata } from "next";
import AllLeggings from "@/components/leggings/all-leggings";
import LeggingsHero from "@/components/leggings/leggings-hero";
import { getSubcategoryProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "All Leggings | Lunexa",
  description: "Shop all women's leggings at Lunexa.",
};

export default async function AllLeggingsPage() {
  // The women's listing products, from MongoDB
  const products = await getSubcategoryProducts("leggings");

  return (
    <>
      <LeggingsHero />
      <AllLeggings products={products} />
    </>
  );
}