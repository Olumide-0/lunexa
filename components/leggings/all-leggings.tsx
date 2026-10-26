"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronDown, Heart, SlidersHorizontal, X } from "lucide-react";
import {
  filterOptions,
  leggingsProducts,
  sortOptions,
  type FilterKey,
  type LeggingsProduct,
  type SortValue,
} from "@/data/leggings";
import { formatPrice, productToWishlistItem } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

const PAGE_SIZE = 28; // 7 rows of 4, like the design

// Sizes shown in the hover panel on each card
const cardSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

// Sidebar section titles, in the design's order
const filterSections: { key: FilterKey; title: string }[] = [
  { key: "size", title: "Size" },
  { key: "features", title: "Features" },
  { key: "fit", title: "Fit" },
  { key: "collections", title: "Collections" },
  { key: "color", title: "Color" },
  { key: "patterns", title: "Patterns" },
  { key: "discount", title: "Discount" },
  { key: "price", title: "Price" },
];

type SelectedFilters = Record<FilterKey, string[]>;

const emptyFilters: SelectedFilters = {
  size: [],
  features: [],
  fit: [],
  collections: [],
  color: [],
  patterns: [],
  discount: [],
  price: [],
};

/* ---------- Does a product match one option of a section? ---------- */
function matchesOption(product: LeggingsProduct, key: FilterKey, option: string): boolean {
  switch (key) {
    case "size":
      return product.sizes.includes(option);
    case "features":
      return product.features.includes(option);
    case "fit":
      return product.fit === option;
    case "collections":
      return product.collection === option;
    case "color":
      return product.colorName === option;
    case "patterns":
      return product.pattern === option;
    case "discount":
      return product.discount === parseInt(option); // "20%" → 20
    case "price": {
      const [min, max] = option.replace(/\$/g, "").split("-").map(Number); // "$10-$20" → [10, 20]
      return product.price >= min && product.price <= max;
    }
  }
}

/* ---------- Circle option (radio for Sort, checkbox for filters) ---------- */
function OptionRow({
  type,
  name,
  label,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-[12px] py-[8px]">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="size-[16px] shrink-0 rounded-full border border-[#D4D4D4] transition-colors peer-checked:border-black peer-checked:bg-black peer-focus-visible:ring-2 peer-focus-visible:ring-black/30" />
      <span className="text-[13px] leading-[18px] text-black">{label}</span>
    </label>
  );
}

/* ---------- Collapsible sidebar section ---------- */
function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-[#D4D4D4] py-[20px]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-[15px] font-bold uppercase leading-[20px] text-black">{title}</span>
        <ChevronDown
          strokeWidth={1.5}
          className={`size-[18px] text-black transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && <div className="mt-[12px] flex flex-col">{children}</div>}
    </div>
  );
}

/* ---------- Product card ---------- */
function LeggingsCard({ product }: { product: LeggingsProduct }) {
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
    <article>
      {/* `group` lets the image, badge and size panel react when this box is hovered */}
      <div className="group relative aspect-[245/310] overflow-hidden rounded-[4px] bg-[#E8E4DF]">
        <Image
          src={product.images[0]}
          alt={`${product.name} - ${product.subtitle}`}
          fill
          sizes="(min-width: 1024px) 245px, (min-width: 768px) 33vw, 50vw"
          className="scale-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <button
          type="button"
          aria-label={showFilled ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={showFilled}
          onClick={handleHeartClick}
          className="absolute right-[10px] top-[10px] flex size-[22px] items-center justify-center rounded-full bg-white"
        >
          <Heart strokeWidth={1.5} className={`size-[11px] text-black ${showFilled ? "fill-black" : ""}`} />
        </button>
        {product.badge && (
          <span className="absolute bottom-[12px] left-[10px] bg-white px-[6px] py-[3px] text-[11px] font-bold uppercase leading-[14px] text-black transition-opacity duration-300 group-focus-within:opacity-0 group-hover:opacity-0">
            {product.badge}
          </span>
        )}

        {/* Hover: size panel slides up. Clicking a size adds it to the bag. */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#F2F2F2]/60 px-[13px] py-[14px] opacity-0 transition-all duration-300 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="grid grid-cols-5 gap-x-[7px] gap-y-[8px]">
            {cardSizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-label={`Add ${product.name} size ${size} to bag`}
                onClick={() => addToCart(product, size)}
                className="flex h-[19px] items-center justify-center rounded-[2px] bg-white text-[10px] font-semibold leading-none text-black transition-colors hover:bg-black hover:text-white"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
      <h3 className="mt-[10px] text-[14px] leading-[20px] text-black">{product.name}</h3>
      <p className="mt-[2px] text-[12px] leading-[16px] text-[#6B6B6B]">{product.subtitle}</p>
      <p className="mt-[4px] flex items-center gap-[6px] text-[13px] font-bold leading-[18px] text-black">
        {formatPrice(product.price)}
        {product.compareAtPrice && (
          <span className="font-normal text-[#6B6B6B] line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </p>
    </article>
  );
}

/* ---------- The whole listing: sidebar + grid + load more ---------- */
export default function AllLeggings() {
  const [sort, setSort] = useState<SortValue>("relevancy");
  const [selected, setSelected] = useState<SelectedFilters>(emptyFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // 1. Filter: OR inside a section, AND between sections
  //    (e.g. Black OR Blue, AND size XS)
  // 2. Sort the result
  const results = useMemo(() => {
    const filtered = leggingsProducts.filter((product) =>
      filterSections.every(({ key }) => {
        const chosen = selected[key];
        return chosen.length === 0 || chosen.some((option) => matchesOption(product, key, option));
      })
    );

    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "newest") sorted.reverse(); // higher number = added later
    return sorted;
  }, [selected, sort]);

  const visibleProducts = results.slice(0, visibleCount);
  const hasActiveFilters = Object.values(selected).some((list) => list.length > 0);

  function toggleOption(key: FilterKey, option: string) {
    setSelected((current) => ({
      ...current,
      [key]: current[key].includes(option)
        ? current[key].filter((value) => value !== option)
        : [...current[key], option],
    }));
    setVisibleCount(PAGE_SIZE); // start from the first page again
  }

  function clearAll() {
    setSelected(emptyFilters);
    setSort("relevancy");
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section className="w-11/12 container mx-auto pb-[100px]">
      {/* Mobile: button that shows / hides the sidebar */}
      <button
        type="button"
        onClick={() => setMobileFiltersOpen((value) => !value)}
        aria-expanded={mobileFiltersOpen}
        className="mb-[20px] flex h-[44px] w-full items-center justify-center gap-[8px] rounded-full border border-black text-[14px] font-semibold uppercase lg:hidden"
      >
        {mobileFiltersOpen ? (
          <X strokeWidth={1.5} className="size-[18px]" />
        ) : (
          <SlidersHorizontal strokeWidth={1.5} className="size-[18px]" />
        )}
        Filter & Sort
      </button>

      <div className="flex flex-col gap-[24px] lg:flex-row">
        {/* Sidebar */}
        <aside className={`${mobileFiltersOpen ? "block" : "hidden"} w-full shrink-0 lg:block lg:w-[300px]`}>
          <div className="border-b border-[#D4D4D4] pb-[20px]">
            <p className="text-[13px] uppercase leading-[18px] text-[#4D4D4D]">Women</p>
            <p className="mt-[4px] flex items-baseline gap-[12px]">
              <span className="text-[17px] font-bold uppercase leading-[22px] text-black">Leggings</span>
              <span className="text-[11px] uppercase leading-[14px] text-black">
                {results.length} products
              </span>
            </p>
          </div>

          <div className="flex items-center justify-between border-b border-[#D4D4D4] py-[20px]">
            <h2 className="text-[16px] font-bold uppercase leading-[20px] text-black">Filters & Sort</h2>
            <button
              type="button"
              onClick={clearAll}
              className="text-[12px] uppercase leading-[16px] text-black hover:underline disabled:cursor-default disabled:opacity-40 disabled:hover:no-underline"
              disabled={!hasActiveFilters && sort === "relevancy"}
            >
              Clear all
            </button>
          </div>

          <SidebarSection title="Sort by">
            {sortOptions.map((option) => (
              <OptionRow
                key={option.value}
                type="radio"
                name="sort"
                label={option.label}
                checked={sort === option.value}
                onChange={() => {
                  setSort(option.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              />
            ))}
          </SidebarSection>

          {filterSections.map(({ key, title }) => (
            <SidebarSection key={key} title={title}>
              {filterOptions[key].map((option) => (
                <OptionRow
                  key={option}
                  type="checkbox"
                  name={key}
                  label={option}
                  checked={selected[key].includes(option)}
                  onChange={() => toggleOption(key, option)}
                />
              ))}
            </SidebarSection>
          ))}
        </aside>

        {/* Product grid */}
        <div className="min-w-0 flex-1">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-[80px] text-center">
              <p className="text-[18px] font-bold uppercase text-black">No products found</p>
              <p className="mt-[8px] text-[14px] text-[#6B6B6B]">
                Try removing some filters to see more leggings.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-[20px] h-[44px] rounded-full bg-black px-[28px] text-[14px] font-semibold text-white hover:bg-[#333333]"
              >
                Clear all
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-[10px] gap-y-[40px] md:grid-cols-3 lg:grid-cols-4">
                {visibleProducts.map((product) => (
                  <LeggingsCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load more */}
              <div className="mt-[80px] flex flex-col items-center">
                {visibleCount < results.length && (
                  <>
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                      className="h-[48px] rounded-full bg-black px-[28px] text-[15px] font-semibold text-white transition-colors hover:bg-[#333333]"
                    >
                      Load More
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(results.length)}
                      className="mt-[12px] text-[12px] text-[#6B6B6B] underline underline-offset-[2px] hover:text-black"
                    >
                      View All
                    </button>
                  </>
                )}
                <p className="mt-[16px] text-[13px] leading-[18px] text-black">
                  Viewing 1 - {visibleProducts.length} of {results.length} products
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}