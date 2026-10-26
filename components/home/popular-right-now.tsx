"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product, WishlistItem } from "@/types";
import women1 from "../../public/images/Frame 7 (7).png";
import women2 from "../../public/images/Frame 7 (8).png";
import women3 from "../../public/images/Frame 7 (9).png";
import men1 from "../../public/images/Frame 7 (4).png";
import men2 from "../../public/images/Frame 7 (5).png";
import men3 from "../../public/images/Frame 7 (6).png";

type Audience = "women" | "men";

type Collection = {
  id: string;
  title: string;
  description: string;
  image: StaticImageData | string;
  href: string;
};

const collections: Record<Audience, Collection[]> = {
  women: [
    {
      id: "athleisure",
      title: "Athleisure looks just landed",
      description: "Comfy styles to layer up or down with. Either way, you’ll be wearing them.",
      image: women1,
      href: "/women/athleisure",
    },
    {
      id: "running",
      title: "Running",
      description: "Running stuff so good it’ll (almost) make you want to do cardio.",
      image: women2,
      href: "/women/running",
    },
    {
      id: "sports-bras",
      title: "Sports bras",
      description:
        "Lifting, running, yoga-ing... Whatever you’re up to, pick a sports bra that moves with you.",
      image: women3,
      href: "/women/sport-bras",
    },
    // Placeholder: reuses women1 until the real 4th image is ready. Replace title/description too.
    {
      id: "pink",
      title: "Pink",
      description: "Replace with the real description from the design.",
      image: women1,
      href: "/women",
    },
  ],
  // Placeholder text: the design only shows the Women tab. Replace with the Men content.
  men: [
    {
      id: "athleisure",
      title: "Athleisure looks just landed",
      description: "Comfy styles to layer up or down with. Either way, you’ll be wearing them.",
      image: men1,
      href: "/men/athleisure",
    },
    {
      id: "running",
      title: "Running",
      description: "Running stuff so good it’ll (almost) make you want to do cardio.",
      image: men2,
      href: "/men/running",
    },
    {
      id: "t-shirts",
      title: "T-shirts & tops",
      description: "Replace with the real description from the design.",
      image: men3,
      href: "/men/t-shirts-and-tops",
    },
    // Placeholder: reuses men1 until the real 4th image is ready
    {
      id: "shorts",
      title: "Shorts",
      description: "Replace with the real description from the design.",
      image: men1,
      href: "/men/shorts",
    },
  ],
};

// Sizes shown in the hover panel
const cardSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

// Turns a card into a Product so it can go in the bag.
// Placeholder price/stock until the backend gives real products.
function toProduct(item: Collection, audience: Audience): Product {
  return {
    id: `popular-${audience}-${item.id}`,
    slug: `popular-${audience}-${item.id}`,
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

export default function PopularRightNow() {
  const [audience, setAudience] = useState<Audience>("women");
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const savedItems = useWishlistStore((state) => state.items);
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const openPopup = useWishlistStore((state) => state.openPopup);
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

  // Signed out: ask them to sign in. Signed in: save / unsave.
  function handleHeartClick(wishlistItem: WishlistItem) {
    if (!isLoggedIn) {
      openPopup("card");
      return;
    }
    toggleItem(wishlistItem);
  }

  return (
    <section className="w-11/12 container mx-auto pt-[12px]">
      {/* Header */}
      <div className="px-[16px] lg:pl-[20px] lg:pr-[48px]">
        <h2 className="text-[20px] font-bold uppercase leading-[28px] text-black sm:text-[24px]">
          Popular right now
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
        {collections[audience].map((item) => {
          const wishlistItem: WishlistItem = {
            id: `popular-${audience}-${item.id}`,
            title: item.title,
            subtitle: audience === "women" ? "Women" : "Men",
            image: item.image,
            href: item.href,
          };
          const showFilled =
            isLoggedIn && savedItems.some((saved) => saved.id === wishlistItem.id);
          const product = toProduct(item, audience);

          return (
            <article key={wishlistItem.id} className="w-[80vw] shrink-0 snap-start sm:w-[446px]">
              <div className="group relative aspect-[446/565] overflow-hidden rounded-[6px] bg-[#E8E8E8]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 640px) 446px, 80vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label={showFilled ? "Remove from wishlist" : "Save to wishlist"}
                  aria-pressed={showFilled}
                  onClick={() => handleHeartClick(wishlistItem)}
                  className="absolute right-[14px] top-[14px] flex size-[34px] items-center justify-center rounded-full bg-white"
                >
                  <Heart
                    strokeWidth={1.5}
                    className={`size-[16px] text-black ${showFilled ? "fill-black" : ""}`}
                  />
                </button>

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
              <p className="mt-[10px] min-h-[42px] text-[16px] leading-[21px] text-[#6B6B6B]">
                {item.description}
              </p>
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