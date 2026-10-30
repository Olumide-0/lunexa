"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { formatPrice, productToWishlistItem } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";

/* ---------- Card for this section ---------- */
function EverydaySeamlessCard({ product }: { product: Product }) {
  const wishlistItem = productToWishlistItem(product);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isSaved = useWishlistStore((state) =>
    state.items.some((saved) => saved.id === wishlistItem.id)
  );
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const openPopup = useWishlistStore((state) => state.openPopup);
  const addToCart = useCartStore((state) => state.addItem);

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
      <div className="group relative aspect-[446/565] overflow-hidden rounded-[6px] bg-[#E8E4DF]">
        <Link href={wishlistItem.href} aria-label={product.name} className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 446px, 80vw"
            className="object-cover"
          />
        </Link>

        {/* Wishlist heart */}
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

        {/* Badge */}
        {product.badge && (
          <span className="absolute bottom-[25px] left-[15px] bg-white px-[11px] py-[6px] text-[15px] font-semibold uppercase leading-[20px] text-black transition-opacity duration-300 group-focus-within:opacity-0 group-hover:opacity-0">
            {product.badge}
          </span>
        )}

        {/* Hover: size panel slides up. Clicking a size adds it to the bag. */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#F2F2F2]/60 px-[22px] py-[24px] opacity-0 transition-all duration-300 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="grid grid-cols-5 gap-x-[12px] gap-y-[12px]">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-label={`Add ${product.name} size ${size} to bag`}
                onClick={() => addToCart(product, size)}
                className="flex h-[34px] items-center justify-center rounded-[3px] bg-white text-[14px] font-semibold leading-none text-black transition-colors hover:bg-black hover:text-white"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-[20px]">
        <h3 className="text-[17px] leading-[22px] text-[#1A1A1A]">
          <Link href={wishlistItem.href} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        {product.subtitle && (
          <p className="mt-[8px] text-[15px] leading-[20px] text-[#6B6B6B]">
            {product.subtitle}
          </p>
        )}
        <p className="mt-[9px] text-[14px] font-semibold leading-[20px] text-black">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}

/* ---------- Section ---------- */
export default function EverydaySeamlessCarousel({ products }: { products: Product[] }) {
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
    <section className="w-11/12 container mx-auto pt-[110px]">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] lg:pl-[20px] lg:pr-[48px]">
        <div className="flex items-baseline gap-[16px]">
          <h2 className="text-[20px] font-bold uppercase leading-[28px] text-black sm:text-[24px]">
            New in: Everyday Seamless
          </h2>
          <Link
            href="/women/everyday-seamless"
            className="text-[15px] font-bold uppercase text-black underline underline-offset-[3px] hover:opacity-60"
          >
            View all
          </Link>
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

      {/* Cards */}
      <div
        ref={trackRef}
        className="no-scrollbar mt-[26px] flex snap-x snap-mandatory gap-[16px] overflow-x-auto px-[16px] scroll-px-[16px] lg:px-[20px] lg:scroll-px-[20px]"
      >
        {products.map((product) => (
          <EverydaySeamlessCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}