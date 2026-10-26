import type { Metadata } from "next";
import EverydaySeamlessCarousel from "@/components/women/everyday-seamless-carousel";
import WomenHero from "@/components/women/hero";
import HotRightNow from "@/components/women/hot-right-now";
import WomenHowDoYouTrain from "@/components/women/how-do-you-train";
import NewInCarousel from "@/components/women/new-in-carousel";
import RestockBanner from "@/components/women/restock-banner";
import TopBestsellers from "@/components/women/top-bestsellers";
import WhiteSimmonsCarousel from "@/components/women/white-simmons-carousel";
import WomensFavorites from "@/components/women/womens-favorites";

export const metadata: Metadata = {
  title: "Women | Lunexa",
  description: "Shop women’s gym wear, leggings, sports bras and more.",
};

export default function WomenPage() {
  return (
    <>
      <WomenHero />
      <NewInCarousel />
      <RestockBanner />
      <WhiteSimmonsCarousel />
      <EverydaySeamlessCarousel />
      <WomensFavorites />
      <HotRightNow />
      <TopBestsellers />
      <WomenHowDoYouTrain />
    </>
  );
}