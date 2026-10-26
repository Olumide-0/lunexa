"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { WishlistItem } from "@/types";
import hot1 from "../../public/images/Frame 7 (28).png";
import hot2 from "../../public/images/Frame 7 (8).png";
import hot3 from "../../public/images/Frame 7 (29).png";


type HotItem = {
  id: string;
  title: string;
  description: string;
  image: StaticImageData | string;
  href: string;
};

// Text copied from the design
const hotItems: HotItem[] = [
  {
    id: "summer-best-sellers",
    title: "Summer best-sellers",
    description: "Comfy styles to layer up or down with. Either way, you’ll be wearing them.",
    image: hot1,
    href: "/women/summer-best-sellers",
  },
  {
    id: "for-every-run",
    title: "For every run",
    description: "Running stuff so good it’ll (almost) make you want to do cardio.",
    image: hot2,
    href: "/women/running",
  },
  {
    id: "get-em-in-pink",
    title: "Get ’em in pink",
    description:
      "Lifting, running, yoga-ing... Whatever you’re up to, pick a sports bra that moves with you.",
    image: hot3,
    href: "/women/pink",
  },
  // Placeholder: the 4th card is cut off in the design ("EV…", "Pink…"). Reuses hot1 for now.
  {
    id: "everyday",
    title: "Everyday seamless",
    description: "Replace with the real description from the design.",
    image: hot1,
    href: "/women/everyday-seamless",
  },
];

/* ---------- Card for this section ---------- */
function HotCard({ item }: { item: HotItem }) {
  const wishlistItem: WishlistItem = {
    id: `women-hot-${item.id}`,
    title: item.title,
    subtitle: "Women",
    image: item.image,
    href: item.href,
  };
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isSaved = useWishlistStore((state) =>
    state.items.some((saved) => saved.id === wishlistItem.id)
  );
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const openPopup = useWishlistStore((state) => state.openPopup);

  // Signed out: ask them to sign in. Signed in: save / unsave.
  function handleHeartClick() {
    if (!isLoggedIn) {
      openPopup("card");
      return;
    }
    toggleItem(wishlistItem);
  }

  const showFilled = isLoggedIn && isSaved;

  return (
    <article className="w-[80vw] shrink-0 snap-start sm:w-[446px]">
      <div className="relative aspect-[446/565] overflow-hidden rounded-[6px] bg-[#E8E4DF]">
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
          onClick={handleHeartClick}
          className="absolute right-[14px] top-[14px] flex size-[34px] items-center justify-center rounded-full bg-white"
        >
          <Heart
            strokeWidth={1.5}
            className={`size-[16px] text-black ${showFilled ? "fill-black" : ""}`}
          />
        </button>
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
}

/* ---------- Section ---------- */
export default function HotRightNow() {
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

  return (
    // Small top padding: Women's Favorites above already adds 100px below itself
    <section className="w-11/12 container mx-auto pt-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] lg:pl-[20px] lg:pr-[48px]">
        <h2 className="text-[20px] font-bold uppercase leading-[28px] text-black sm:text-[24px]">
          Hot right now
        </h2>
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

      {/* Cards */}
      <div
        ref={trackRef}
        className="no-scrollbar mt-[26px] flex snap-x snap-mandatory gap-[16px] overflow-x-auto px-[16px] scroll-px-[16px] lg:px-[20px] lg:scroll-px-[20px]"
      >
        {hotItems.map((item) => (
          <HotCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}