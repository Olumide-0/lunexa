import GetTheLook from "@/components/home/get-the-look";
import Hero from "@/components/home/hero";
import HowDoYouTrain from "@/components/home/how-do-you-train";
import MainCategories from "@/components/home/main-categories";
import PopularRightNow from "@/components/home/popular-right-now";
import ProductCarousel from "@/components/home/product-carousel";
import PromoBanner from "@/components/home/promo-banner";
import { looks } from "@/data/looks";
import { products } from "@/data/products";

export default function Home() {
  return (
    <>
      <Hero />
      <GetTheLook title="Best Seller" looks={looks} />
      {/* Search → Trending → "Whitney" scrolls here */}
      <div id="white-simmons" className="scroll-mt-[72px] lg:scroll-mt-[103px]">
        <ProductCarousel
          eyebrow="Women"
          title="White Simmons"
          viewAllHref="/women/white-simmons"
          products={products.filter((p) => p.collection === "white-simmons")}
        />
      </div>
      <PromoBanner />
      <ProductCarousel
        eyebrow="Men"
        title="Workout shirts you’ll want to live in"
        viewAllHref="/men/t-shirts-and-tops"
        products={products.filter((p) => p.collection === "workout-shirts")}
      />
      {/* Search → Trending → "Pink Gym Sets" scrolls here */}
      <div id="popular-right-now" className="scroll-mt-[72px] lg:scroll-mt-[103px]">
        <PopularRightNow />
      </div>
      <HowDoYouTrain />
      <MainCategories />
    </>
  );
}