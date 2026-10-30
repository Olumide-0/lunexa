import type { Metadata } from "next";
import GymLeggings from "@/components/gym-leggings/gym-leggings";
import GymLeggingsHero from "@/components/gym-leggings/gym-leggings-hero";
import { getSubcategoryProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Gym Leggings | Lunexa",
  description: "Shop women's gym leggings at Lunexa.",
};

export default async function GymLeggingsPage() {
  // Same women's listing products for now (later: only the gym leggings)
  const products = await getSubcategoryProducts("leggings");

  return (
    <>
      <GymLeggingsHero />
      <GymLeggings products={products} />
    </>
  );
}