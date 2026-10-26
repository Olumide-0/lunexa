import type { Metadata } from "next";
import DevantCarousel from "@/components/men/devant-carousel";
import MenHero from "@/components/men/hero";
import MenHowDoYouTrain from "@/components/men/how-do-you-train";
import NewInShorts from "@/components/men/new-in-shorts";
import ShortsBanner from "@/components/men/shorts-banner";
import MenTopBestsellers from "@/components/men/top-bestsellers";
import TrendingRightNow from "@/components/men/trending-right-now";

export const metadata: Metadata = {
  title: "Men | Lunexa",
  description: "Shop men’s gym wear, shorts, T-shirts, stringers and more.",
};

export default function MenPage() {
  return (
    <>
      <MenHero />
      <DevantCarousel />
      <ShortsBanner />
      <TrendingRightNow />
      {/* Search → Trending → "Men Shorts" scrolls here */}
      <div id="new-in-shorts" className="scroll-mt-[72px] lg:scroll-mt-[103px]">
        <NewInShorts />
      </div>
      <MenTopBestsellers />
      <MenHowDoYouTrain />
    </>
  );
}