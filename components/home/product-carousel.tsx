"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import type { Product } from "@/types";

export default function ProductCarousel({
  eyebrow,
  title,
  viewAllHref,
  products,
}: {
  eyebrow?: string;
  title: string;
  viewAllHref?: string;
  products: Product[];
}) {
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
    <section className="w-11/12 container mx-auto pb-[80px] pt-[83px]">
      {/* Header */}
      <div className="flex items-end justify-between px-[16px] lg:pl-[20px] lg:pr-[48px]">
        <div>
          {eyebrow && (
            <p className="mb-[16px] text-[15px] uppercase leading-[20px] text-[#6B6B6B]">
              {eyebrow}
            </p>
          )}
          <div className="flex items-baseline gap-[16px]">
            <h2 className="text-[20px] font-bold uppercase leading-[28px] text-black sm:text-[24px]">
              {title}
            </h2>
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="text-[15px] font-bold uppercase text-black underline underline-offset-[3px] hover:opacity-60"
              >
                View all
              </Link>
            )}
          </div>
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}