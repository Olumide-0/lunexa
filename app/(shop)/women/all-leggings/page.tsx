import type { Metadata } from "next";
import AllLeggings from "@/components/leggings/all-leggings";
import LeggingsHero from "@/components/leggings/leggings-hero";

export const metadata: Metadata = {
  title: "All Leggings | Lunexa",
  description: "Shop all women's leggings at Lunexa.",
};

export default function AllLeggingsPage() {
  return (
    <>
      <LeggingsHero />
      <AllLeggings />
    </>
  );
}