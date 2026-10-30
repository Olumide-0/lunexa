"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types";
import women1 from "../../public/images/Frame 7 (10).png";
import women2 from "../../public/images/Frame 7 (11).png";
import women3 from "../../public/images/Frame 7 (12).png";
import men1 from "../../public/images/Frame 7 (13).png";
import men2 from "../../public/images/Frame 7 (14).png";
import men3 from "../../public/images/Frame 7 (15).png";

type Audience = "women" | "men";

type Activity = {
  id: string;
  title: string;
  image: StaticImageData | string;
  href: string;
};

const activities: Record<Audience, Activity[]> = {
  women: [
    { id: "lifting", title: "Lifting", image: women1, href: "/women/lifting" },
    { id: "running", title: "Running", image: women2, href: "/women/running" },
    { id: "pilates", title: "Pilates", image: women3, href: "/women/pilates" },
    // Placeholder: reuses women1 until the real HIIT image is ready
    { id: "hiit", title: "HIIT", image: women1, href: "/women/hiit" },
  ],
  men: [
    { id: "lifting", title: "Lifting", image: men1, href: "/men/lifting" },
    { id: "running", title: "Running", image: men2, href: "/men/running" },
    { id: "pilates", title: "Pilates", image: men3, href: "/men/pilates" },
    // Placeholder: reuses men1 until the real HIIT image is ready
    { id: "hiit", title: "HIIT", image: men1, href: "/men/hiit" },
  ],
};

// Sizes shown in the hover panel
const cardSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

// Turns a card into a Product so it can go in the bag.
// Placeholder price/stock until the backend gives real products.
function toProduct(item: Activity, audience: Audience): Product {
  return {
    id: `train-${audience}-${item.id}`,
    slug: `train-${audience}-${item.id}`,
    name: item.title,
    subtitle: audience === "women" ? "Women" : "Men",
    description: item.title,
    price: 40,
    images: [item.image],
    category: audience,
    sizes: cardSizes,
    colors: [],
    stock: 20,
    rating: 0,
    reviewCount: 0,
  };
}

export default function HowDoYouTrain() {
  const [audience, setAudience] = useState<Audience>("women");
  const addToCart = useCartStore((state) => state.addItem);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Check whether there's more content to the left/right
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateArrows); // runs once now, then on resize
    observer.observe(el);
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateArrows);
    };
  }, [updateArrows]);

  // Move by exactly one card (card width + gap)
  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  // Switch Women/Men and jump the carousel back to the first card
  function changeAudience(next: Audience) {
    setAudience(next);
    trackRef.current?.scrollTo({ left: 0 });
  }

  return (
    <section className="w-11/12 container mx-auto pt-[84px]">
      {/* Header */}
      <div className="px-[16px] lg:pl-[20px] lg:pr-[48px]">
        <h2 className="text-[20px] font-bold uppercase leading-[28px] text-black sm:text-[24px]">
          How do you train
        </h2>
        <div className="mt-[20px] flex items-center justify-between">
          <div className="flex gap-[12px]">
            {(["women", "men"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={audience === option}
                onClick={() => changeAudience(option)}
                className={`h-[48px] rounded-full px-[26px] text-[16px] font-medium capitalize transition-colors ${
                  audience === option
                    ? "bg-black text-white"
                    : "bg-[#EBEBEB] text-black hover:bg-[#DCDCDC]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex gap-[8px]">
            <button
              type="button"
              aria-label="Previous"
              disabled={!canPrev}
              onClick={() => scrollByCard(-1)}
              className={`flex size-[34px] items-center justify-center rounded-full transition-colors ${
                canPrev ? "bg-black text-white" : "cursor-default bg-[#E5E5E5] text-black"
              }`}
            >
              <ChevronLeft strokeWidth={1.75} className="size-[16px]" />
            </button>
            <button
              type="button"
              aria-label="Next"
              disabled={!canNext}
              onClick={() => scrollByCard(1)}
              className={`flex size-[34px] items-center justify-center rounded-full transition-colors ${
                canNext ? "bg-black text-white" : "cursor-default bg-[#E5E5E5] text-black"
              }`}
            >
              <ChevronRight strokeWidth={1.75} className="size-[16px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={trackRef}
        className="no-scrollbar mt-[20px] flex snap-x snap-mandatory gap-[16px] overflow-x-auto px-[16px] scroll-px-[16px] lg:px-[20px] lg:scroll-px-[20px]"
      >
        {activities[audience].map((item) => {
          const product = toProduct(item, audience);

          return (
            <article
              key={`${audience}-${item.id}`}
              className="w-[80vw] shrink-0 snap-start sm:w-[446px]"
            >
              <div className="group relative aspect-[446/565] overflow-hidden rounded-[6px] bg-[#E8E8E8]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 640px) 446px, 80vw"
                  className="object-cover"
                />
                {/* Clicking the image opens this product's page (the heart and sizes sit on top of it) */}
                <Link href={`/products/${product.slug}`} aria-label={item.title} className="absolute inset-0" />

                {/* Hover: size panel slides up. Clicking a size adds it to the bag. */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#F2F2F2]/60 px-[22px] py-[24px] opacity-0 transition-all duration-300 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="grid grid-cols-5 gap-x-[12px] gap-y-[12px]">
                    {cardSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        aria-label={`Add ${item.title} size ${size} to bag`}
                        onClick={() => addToCart(product, size)}
                        className="flex h-[34px] items-center justify-center rounded-[3px] bg-white text-[14px] font-semibold leading-none text-black transition-colors hover:bg-black hover:text-white"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="mt-[20px] text-[20px] font-bold uppercase leading-[24px] text-black">
                {item.title}
              </h3>
              <Link
                href={item.href}
                className="mt-[20px] inline-flex h-[48px] items-center rounded-full bg-black px-[24px] text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
              >
                Shop Now
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}