import GetTheLook from "@/components/home/get-the-look";
import Hero from "@/components/home/hero";
import HowDoYouTrain from "@/components/home/how-do-you-train";
import MainCategories from "@/components/home/main-categories";
import PopularRightNow from "@/components/home/popular-right-now";
import ProductCarousel from "@/components/home/product-carousel";
import PromoBanner from "@/components/home/promo-banner";
import { looks } from "@/data/looks";
import { getCollectionProducts } from "@/lib/products";

export default async function HomePage() {
  // Products for the two homepage carousels, from MongoDB
  const [whiteSimmonsProducts, workoutShirtProducts] = await Promise.all([
    getCollectionProducts("white-simmons"),
    getCollectionProducts("workout-shirts"),
  ]);

  return (
    <>
      <Hero />
      <GetTheLook title="Best Seller" looks={looks} />

      {/* id lets the search "Whitney" link scroll here; scroll-mt keeps it below the sticky navbar */}
      <div id="white-simmons" className="scroll-mt-[72px] lg:scroll-mt-[85px]">
        <ProductCarousel
          eyebrow="Women"
          title="White Simmons"
          products={whiteSimmonsProducts}
          linkImages={false}
        />
      </div>

      <PromoBanner />

      <ProductCarousel
        eyebrow="Men"
        title="Workout shirts you’ll want to live in"
        products={workoutShirtProducts}
        linkImages={false}
      />

      {/* id lets the search "Pink Gym Sets" link scroll here */}
      <div id="popular-right-now" className="scroll-mt-[72px] lg:scroll-mt-[85px]">
        <PopularRightNow />
      </div>

      <HowDoYouTrain />
      <MainCategories />
    </>
  );
}