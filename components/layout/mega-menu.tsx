"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { MenuCategory, NavMenu } from "@/data/navigation";
import { slugify } from "@/lib/utils";
import liftImage from "../../public/images/Frame 7 (19).png";
import simmonsImage from "../../public/images/Frame 7 (1).png";
import devantImage from "../../public/images/Frame 7 (36).png";
import shortsImage from "../../public/images/Frame 7 (42).png";

type Audience = "women" | "men";

interface PromoTile {
  label: string;
  href: string;
  image: StaticImageData;
}

// The two image tiles under the categories (hardcoded per menu).
// Accessories reuses placeholders until we have its images.
const promoTiles: Record<string, PromoTile[]> = {
  Women: [
    { label: "Lift Seamless 2.0", href: "/women", image: liftImage },
    { label: "White Simmons", href: "/#white-simmons", image: simmonsImage },
  ],
  Men: [
    { label: "Devant", href: "/men", image: devantImage },
    { label: "New In: Shorts", href: "/men#new-in-shorts", image: shortsImage },
  ],
  Accessories: [
    { label: "Lift Seamless 2.0", href: "/women", image: liftImage },
    { label: "Devant", href: "/men", image: devantImage },
  ],
};

export default function MegaMenu({
  menu,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: {
  menu: NavMenu;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate: () => void;
}) {
  const [audience, setAudience] = useState<Audience>("women");
  // Which category is hovered. Starts as null = nothing hovered yet, so only the categories show.
  // The navbar gives this component a new `key` per menu, so it resets when you switch menus.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const categories: MenuCategory[] = menu.audiences
    ? menu.audiences[audience]
    : menu.categories ?? [];

  const activeCategory = activeIndex === null ? null : categories[activeIndex];
  const basePath = menu.audiences ? `${menu.href}/${audience}` : menu.href;
  const tiles = promoTiles[menu.label] ?? [];

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-0 top-full hidden max-h-[calc(100vh-103px)] overflow-y-auto border-t border-[#E5E5E5] bg-white shadow-[8px_16px_40px_rgba(0,0,0,0.12)] lg:flex"
    >
      {/* Left column: categories + image tiles */}
      <div className="flex w-[400px] shrink-0 flex-col pb-[16px]">
        {/* Women / Men toggle (Accessories only) */}
        {menu.audiences && (
          <div className="flex gap-[8px] px-[48px] pt-[32px]">
            {(["women", "men"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={audience === option}
                onClick={() => {
                  setAudience(option);
                  setActiveIndex(null);
                }}
                className={`h-[40px] rounded-full px-[24px] text-[15px] capitalize transition-colors ${
                  audience === option
                    ? "bg-black text-white"
                    : "bg-[#EBEBEB] text-black hover:bg-[#DCDCDC]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <ul className="px-[48px] pt-[24px]">
          {categories.map((category, index) => {
            const isActive = index === activeIndex;

            return (
              <li key={category.title}>
                <Link
                  href={`${basePath}/${slugify(category.title)}`}
                  onClick={onNavigate}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className={`flex items-center justify-between py-[18px] text-[18px] leading-[24px] ${
                    category.highlight ? "text-[#C0272D]" : "text-black"
                  }`}
                >
                  <span
                    className={`border-b-2 pb-[4px] ${
                      isActive ? "border-current" : "border-transparent"
                    }`}
                  >
                    {category.title}
                  </span>
                  <ChevronRight strokeWidth={1.5} className="size-[20px] text-black" />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Image tiles */}
        {tiles.length > 0 && (
          <div className="mt-[48px] flex flex-col gap-[8px] px-[16px]">
            {tiles.map((tile) => (
              <Link
                key={tile.label}
                href={tile.href}
                onClick={onNavigate}
                className="group relative block h-[240px] overflow-hidden"
              >
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="368px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#000000]/20" />
                <span className="absolute bottom-[20px] left-[24px] text-[28px] font-extrabold uppercase leading-[32px] tracking-[-0.5px] text-white">
                  {tile.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right column: only appears after a category is hovered */}
      {activeCategory && (
        <div className="w-[380px] shrink-0 border-l border-[#E5E5E5] px-[36px] pt-[24px]">
          <ul className={menu.audiences ? "pt-[72px]" : ""}>
            {activeCategory.subcategories.map((sub) => (
              <li key={sub}>
                <Link
                  href={`${basePath}/${slugify(sub)}`}
                  onClick={onNavigate}
                  className="block py-[18px] text-[18px] leading-[24px] text-black hover:underline"
                >
                  {sub}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}