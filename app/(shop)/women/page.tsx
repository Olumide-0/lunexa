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
import { getCollectionProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Women | Lunexa",
  description: "Shop women’s gym wear, leggings, sports bras and more.",
};

export default async function WomenPage() {
  // One list per carousel, from MongoDB
  const [newIn, whiteSimmons, everydaySeamless, bestsellers] = await Promise.all([
    getCollectionProducts("lift-seamless-2"),
    getCollectionProducts("white-simmons"),
    getCollectionProducts("everyday-seamless"),
    getCollectionProducts("women-bestsellers"),
  ]);

  return (
    <>
      <WomenHero />
      <NewInCarousel products={newIn} />
      <RestockBanner />
      <WhiteSimmonsCarousel products={whiteSimmons} />
      <EverydaySeamlessCarousel products={everydaySeamless} />
      <WomensFavorites />
      <HotRightNow />
      <TopBestsellers products={bestsellers} />
      <WomenHowDoYouTrain />
    </>
  );
}