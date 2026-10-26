"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Look } from "@/types";

export default function GetTheLook({ title, looks }: { title: string; looks: Look[] }) {
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
    <section className="w-11/12 container mx-auto pt-[80px]">
      {/* Header */}
      <div className="flex items-end justify-between px-[16px] lg:pl-[20px] lg:pr-[48px]">
        <h2 className="text-[20px] font-bold uppercase leading-[28px] text-black sm:text-[24px]">
          {title}
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
        className="no-scrollbar mt-[28px] flex snap-x snap-mandatory gap-[16px] overflow-x-auto px-[16px] scroll-px-[16px] lg:px-[20px] lg:scroll-px-[20px]"
      >
        {looks.map((look) => (
          <div
            key={look.id}
            className="relative aspect-[446/565] w-[80vw] shrink-0 snap-start overflow-hidden rounded-[6px] bg-[#E8E8E8] sm:w-[446px]"
          >
            <Image
              src={look.image}
              alt={`Outfit worn by @${look.handle}`}
              fill
              sizes="(min-width: 640px) 446px, 80vw"
              className="object-cover"
            />
            <span className="absolute left-[16px] top-[24px] rounded-[4px] bg-white px-[9px] py-[5px] text-[12px] uppercase leading-[16px] text-black">
              @{look.handle}
            </span>
            <Link
              href={`/looks/${look.id}`}
              className="absolute bottom-[36px] left-[15px] flex h-[49px] items-center rounded-full bg-black px-[23px] text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
            >
              Get the Look
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}