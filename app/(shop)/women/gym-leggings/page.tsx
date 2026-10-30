import type { Metadata } from "next";
import GymLeggings from "@/components/gym-leggings/gym-leggings";
import GymLeggingsHero from "@/components/gym-leggings/gym-leggings-hero";

export const metadata: Metadata = {
  title: "Gym Leggings | Lunexa",
  description: "Shop women's gym leggings at Lunexa.",
};

export default function GymLeggingsPage() {
  return (
    <>
      <GymLeggingsHero />
      <GymLeggings />
    </>
  );
}