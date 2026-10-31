"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ChevronDown, Heart, SlidersHorizontal, X } from "lucide-react";
import {
  filterOptions,
  sortOptions,
  type FilterKey,
  type SortValue,
} from "@/lib/listing-options";
import Pagination from "@/components/ui/pagination";
import type { ListingProduct } from "@/lib/products";
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
function matchesOption(product: ListingProduct, key: FilterKey, option: string): boolean {
  switch (key) {
    case "size":
      return product.sizes.includes(option);
    case "features":
      return (product.features ?? []).includes(option);
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
function CategoryCard({ product }: { product: ListingProduct }) {
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
      <div className="group relative aspect-[245/310] overflow-hidden rounded-[4px] bg-[#E8E4DF]">
        <Image
          src={product.images[0]}
          alt={`${product.name} - ${product.subtitle}`}
          fill
          sizes="(min-width: 1024px) 245px, (min-width: 768px) 33vw, 50vw"
          className="scale-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {/* Clicking the image opens the product page (the heart and sizes sit on top of it) */}
        <Link
          href={`/products/${product.slug}`}
          aria-label={`${product.name} - ${product.subtitle}`}
          className="absolute inset-0"
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
          <span className="pointer-events-none absolute bottom-[12px] left-[10px] bg-white px-[6px] py-[3px] text-[11px] font-bold uppercase leading-[14px] text-black transition-opacity duration-300 group-focus-within:opacity-0 group-hover:opacity-0">
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
      <h3 className="mt-[10px] text-[14px] leading-[20px] text-black">
        <Link href={`/products/${product.slug}`} className="hover:underline">
          {product.name}
        </Link>
      </h3>
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

/* ---------- Listing: sidebar + grid + pagination ---------- */
// `group` is the bold word in the sidebar, e.g. "Leggings" or "Products"
// `audience` is the small word above it ("Women" or "Men")
export default function CategoryListing({
  group,
  audience = "Women",
  products,
}: {
  group: string;
  audience?: "Women" | "Men";
  products: ListingProduct[]; // from MongoDB, passed in by the page
}) {
  const [sort, setSort] = useState<SortValue>("relevancy");
  const [selected, setSelected] = useState<SelectedFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const gridTop = useRef<HTMLDivElement>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // 1. Filter: OR inside a section, AND between sections
  //    (e.g. Black OR Blue, AND size XS)
  // 2. Sort the result
  const results = useMemo(() => {
    const filtered = products.filter((product) =>
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
  }, [products, selected, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = results.slice(firstIndex, firstIndex + PAGE_SIZE);
  const hasActiveFilters = Object.values(selected).some((list) => list.length > 0);

  function toggleOption(key: FilterKey, option: string) {
    setSelected((current) => ({
      ...current,
      [key]: current[key].includes(option)
        ? current[key].filter((value) => value !== option)
        : [...current[key], option],
    }));
    setPage(1); // start from the first page again
  }

  // Change page and bring the top of the grid back into view
  function goToPage(next: number) {
    setPage(next);
    gridTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearAll() {
    setSelected(emptyFilters);
    setSort("relevancy");
    setPage(1);
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
            <p className="text-[13px] uppercase leading-[18px] text-[#4D4D4D]">{audience}</p>
            <p className="mt-[4px] flex items-baseline gap-[12px]">
              <span className="text-[17px] font-bold uppercase leading-[22px] text-black">{group}</span>
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
                  setPage(1);
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
        <div ref={gridTop} className="min-w-0 flex-1 scroll-mt-[120px]">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-[80px] text-center">
              <p className="text-[18px] font-bold uppercase text-black">No products found</p>
              <p className="mt-[8px] text-[14px] text-[#6B6B6B]">
                Try removing some filters to see more products.
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
                  <CategoryCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-[60px] flex flex-col items-center gap-[16px]">
                <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
                <p className="text-[13px] leading-[18px] text-black">
                  Viewing {firstIndex + 1} - {firstIndex + visibleProducts.length} of {results.length} products
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}