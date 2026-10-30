"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Heart, MoreHorizontal, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product, WishlistItem } from "@/types";

/* ---------- Setup ---------- */

type SortOption = "price-asc" | "price-desc" | "relevancy" | "newest";
type FilterKey = "size" | "gender" | "collection" | "color" | "price";
type Option = { value: string; label: string };

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "relevancy", label: "Relevancy" },
  { value: "newest", label: "Newest" },
];

const priceRanges = [
  { value: "under-50", label: "Under $50", test: (price: number) => price < 50 },
  { value: "50-100", label: "$50 – $100", test: (price: number) => price >= 50 && price <= 100 },
  { value: "over-100", label: "Over $100", test: (price: number) => price > 100 },
];

const emptyFilters: Record<FilterKey, string[]> = {
  size: [],
  gender: [],
  collection: [],
  color: [],
  price: [],
};

const unique = (values: string[]) => Array.from(new Set(values));
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const formatCollection = (value: string) =>
  value.split("-").map(capitalize).join(" "); // "everyday-seamless" → "Everyday Seamless"

// Wait until the saved sign-in and wishlist are loaded, so signed-in users
// don't see a "please sign in" flash on refresh
function useStoresHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const check = () =>
      setHydrated(useAuthStore.persist.hasHydrated() && useWishlistStore.persist.hasHydrated());
    const unsubscribeAuth = useAuthStore.persist.onFinishHydration(check);
    const unsubscribeWishlist = useWishlistStore.persist.onFinishHydration(check);
    check();
    return () => {
      unsubscribeAuth();
      unsubscribeWishlist();
    };
  }, []);

  return hydrated;
}

/* ---------- Sidebar pieces ---------- */

function FilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-[#E5E5E5] first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex h-[59px] w-full items-center justify-between text-left text-[16px] text-black"
      >
        {title}
        <ChevronDown
          strokeWidth={1.75}
          className={`size-[18px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-[20px]">{children}</div>}
    </div>
  );
}

function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-[12px] py-[10px] text-[15px] text-black">
      <input type="radio" name="wishlist-sort" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="flex size-[20px] shrink-0 items-center justify-center rounded-full border border-black peer-focus-visible:ring-2 peer-focus-visible:ring-black peer-focus-visible:ring-offset-2">
        <span className={`size-[12px] rounded-full ${checked ? "bg-black" : ""}`} />
      </span>
      {label}
    </label>
  );
}

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-[12px] py-[8px] text-[15px] text-black">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`flex size-[18px] shrink-0 items-center justify-center border border-black peer-focus-visible:ring-2 peer-focus-visible:ring-black peer-focus-visible:ring-offset-2 ${
          checked ? "bg-black" : "bg-white"
        }`}
      >
        {checked && <span className="size-[8px] bg-white" />}
      </span>
      {label}
    </label>
  );
}

/* ---------- Card ---------- */

function WishlistPageCard({ item, product }: { item: WishlistItem; product?: Product }) {
  const removeItem = useWishlistStore((state) => state.removeItem);
  const addToCart = useCartStore((state) => state.addItem);
  const [size, setSize] = useState("");
  const [showSizeError, setShowSizeError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the "…" menu when clicking outside it
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function handleAddToBag() {
    if (!product) return;
    if (!size) {
      setShowSizeError(true);
      return;
    }
    addToCart(product, size);
    setShowSizeError(false);
  }

  return (
    <article>
      <div className="relative aspect-[250/312] overflow-hidden bg-[#E8E4DF]">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(min-width: 1024px) 250px, 50vw"
          className="object-cover"
        />
        {/* Filled heart: click to remove */}
        <button
          type="button"
          aria-label={`Remove ${item.title} from wishlist`}
          onClick={() => removeItem(item.id)}
          className="absolute right-[14px] top-[14px] text-black transition-opacity hover:opacity-60"
        >
          <Heart strokeWidth={1.5} className="size-[20px] fill-black" />
        </button>
        {product?.badge && (
          <span className="absolute bottom-[12px] left-[8px] bg-white px-[7px] py-[3px] text-[13px] leading-[18px] text-black">
            {product.badge}
          </span>
        )}
      </div>

      <div className="px-[14px] pt-[12px]">
        <div className="flex items-start justify-between gap-[8px]">
          <h3 className="text-[15px] leading-[22px] text-black">
            <Link href={item.href} className="hover:underline">
              {item.title}
            </Link>
          </h3>

          {/* "…" menu */}
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="More options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-black transition-opacity hover:opacity-60"
            >
              <MoreHorizontal strokeWidth={2} className="size-[20px]" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-[4px] w-[200px] rounded-[6px] bg-white py-[6px] shadow-lg">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex w-full items-center gap-[10px] px-[14px] py-[8px] text-left text-[14px] text-black hover:bg-[#F2F2F2]"
                >
                  <Trash2 strokeWidth={1.5} className="size-[16px]" />
                  Remove from wishlist
                </button>
              </div>
            )}
          </div>
        </div>

        {item.subtitle && (
          <p className="mt-[6px] text-[14px] leading-[20px] text-[#6B6B6B]">{item.subtitle}</p>
        )}
        {item.price !== undefined && (
          <p className="mt-[14px] text-[15px] leading-[20px] text-black">{formatPrice(item.price)}</p>
        )}
      </div>

      {product ? (
        /* Size + add to bag */
        <div className="mt-[14px] flex items-center gap-[8px]">
          <div className="relative w-[122px] shrink-0">
            <select
              value={size}
              onChange={(e) => {
                setSize(e.target.value);
                setShowSizeError(false);
              }}
              aria-label={`Select size for ${item.title}`}
              aria-invalid={showSizeError}
              className={`h-[40px] w-full appearance-none border bg-white pl-[11px] pr-[32px] text-[15px] outline-none focus:border-black ${
                showSizeError ? "border-[#D92D20]" : "border-[#CFCFCF]"
              } ${size ? "text-black" : "text-[#737373]"}`}
            >
              <option value="">Size</option>
              {product.sizes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              strokeWidth={1.75}
              className="pointer-events-none absolute right-[10px] top-1/2 size-[16px] -translate-y-1/2 text-black"
            />
          </div>

          <p role="status" className="min-w-0 flex-1 text-[12px] leading-[15px] text-[#D92D20]">
            {showSizeError && "* Please select a size to add to cart"}
          </p>

          <button
            type="button"
            aria-label={`Add ${item.title} to bag`}
            onClick={handleAddToBag}
            className="flex size-[38px] shrink-0 items-center justify-center bg-black transition-colors hover:bg-[#333333]"
          >
            <ShoppingBag strokeWidth={1.5} className="size-[18px] fill-white text-black" />
          </button>
        </div>
      ) : (
        /* Collection cards (not a single product) */
        <Link
          href={item.href}
          className="ml-[14px] mt-[14px] inline-flex h-[40px] items-center rounded-full bg-black px-[20px] text-[14px] font-semibold text-white transition-colors hover:bg-[#333333]"
        >
          Shop now
        </Link>
      )}
    </article>
  );
}

/* ---------- Page ---------- */

export default function WishlistView() {
  const hydrated = useStoresHydrated();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const items = useWishlistStore((state) => state.items);
  const clearItems = useWishlistStore((state) => state.clearItems);
  const [sort, setSort] = useState<SortOption>("relevancy");
  const [filters, setFilters] = useState<Record<FilterKey, string[]>>(emptyFilters);
  const [openSections, setOpenSections] = useState<string[]>(["sort"]);

  // Saved ids look like "product-<database id>". Load those products' full details from the database.
  const productIdsKey = items
    .filter((item) => item.id.startsWith("product-"))
    .map((item) => item.id.slice("product-".length))
    .join(",");
  const [productById, setProductById] = useState<Map<string, Product>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !productIdsKey) return;
    const controller = new AbortController();
    fetch(`/api/products/lookup?ids=${productIdsKey}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data: { products: Product[] }) => {
        setProductById(new Map(data.products.map((p) => [`product-${p.id}`, p])));
        setLoaded(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoaded(true);
      });
    return () => controller.abort();
  }, [isLoggedIn, productIdsKey]);

  const ready = !isLoggedIn || !productIdsKey || loaded;

  // Blank space while saved data loads (avoids a flash of the wrong content)
  if (!hydrated || !ready) return <div className="min-h-[60vh]" />;

  /* ----- Signed out ----- */
  if (!isLoggedIn) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-[1440px] flex-col items-center justify-center px-[16px] py-[80px] text-center">
        <Heart strokeWidth={1.5} className="size-[40px] fill-black text-black" />
        <h1 className="mt-[20px] text-[24px] font-bold uppercase leading-[30px] text-black">
          Sign in to see your wishlist
        </h1>
        <p className="mt-[10px] max-w-[420px] text-[15px] leading-[22px] text-[#1A1A1A]">
          Save your fave fits &amp; accessories in one place and come back to them anytime.
        </p>
        <div className="mt-[24px] flex gap-[8px]">
          <button
            type="button"
            onClick={() => openAuthModal("register")}
            className="flex h-[48px] items-center rounded-full bg-black px-[24px] text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="flex h-[48px] items-center rounded-full bg-[#EBEBEB] px-[24px] text-[16px] font-semibold text-black transition-colors hover:bg-[#DCDCDC]"
          >
            Log In
          </button>
        </div>
      </section>
    );
  }

  /* ----- Build the list ----- */
  const rows = items.map((item, index) => ({
    item,
    index, // order saved (used for Relevancy / Newest)
    product: productById.get(item.id),
  }));

  const savedProducts = rows
    .map((row) => row.product)
    .filter((p): p is Product => Boolean(p));

  // Only show filter options that exist in the saved items
  const filterSections: { key: FilterKey; title: string; options: Option[] }[] = [
    {
      key: "size",
      title: "Size",
      options: unique(savedProducts.flatMap((p) => p.sizes)).map((v) => ({ value: v, label: v })),
    },
    {
      key: "gender",
      title: "Gender",
      options: unique(savedProducts.map((p) => p.category)).map((v) => ({
        value: v,
        label: capitalize(v),
      })),
    },
    {
      key: "collection",
      title: "Collection",
      options: unique(
        savedProducts.map((p) => p.collection).filter((c): c is string => Boolean(c))
      ).map((v) => ({ value: v, label: formatCollection(v) })),
    },
    {
      key: "color",
      title: "Color",
      options: unique(savedProducts.flatMap((p) => p.colors.map((c) => c.name))).map((v) => ({
        value: v,
        label: v,
      })),
    },
    {
      key: "price",
      title: "Price",
      options: priceRanges
        .filter((range) => savedProducts.some((p) => range.test(p.price)))
        .map((range) => ({ value: range.value, label: range.label })),
    },
  ];

  const hasActiveFilters = Object.values(filters).some((values) => values.length > 0);

  // Keep an item only if it passes every active filter
  const filteredRows = rows.filter(({ product }) => {
    if (!hasActiveFilters) return true;
    if (!product) return false; // collection cards have no sizes/colours to filter by
    if (filters.size.length && !filters.size.some((s) => product.sizes.includes(s))) return false;
    if (filters.gender.length && !filters.gender.includes(product.category)) return false;
    if (
      filters.collection.length &&
      !(product.collection && filters.collection.includes(product.collection))
    )
      return false;
    if (filters.color.length && !product.colors.some((c) => filters.color.includes(c.name)))
      return false;
    if (
      filters.price.length &&
      !priceRanges.some((range) => filters.price.includes(range.value) && range.test(product.price))
    )
      return false;
    return true;
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sort === "relevancy") return a.index - b.index; // order saved
    if (sort === "newest") return b.index - a.index; // most recently saved first
    // Items without a price go last
    const fallback = sort === "price-asc" ? Infinity : -Infinity;
    const priceA = a.item.price ?? fallback;
    const priceB = b.item.price ?? fallback;
    return sort === "price-asc" ? priceA - priceB : priceB - priceA;
  });

  function toggleSection(key: string) {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleFilter(key: FilterKey, value: string) {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  }

  function clearAll() {
    setSort("relevancy");
    setFilters(emptyFilters);
  }

  const shown = sortedRows.length;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-[16px] pb-[100px] pt-[30px] lg:px-[34px]">
      {/* Title */}
      <div className="flex items-baseline gap-[14px]">
        <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">Your wishlist</h1>
        <p className="text-[13px] text-[#6B6B6B]">
          {items.length} {items.length === 1 ? "Product" : "Products"}
        </p>
      </div>

      {items.length === 0 ? (
        /* Empty wishlist */
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <div className="flex size-[96px] items-center justify-center rounded-full bg-[#EBEBEB]">
            <Heart strokeWidth={1} className="size-[52px] fill-[#6B6B6B] text-[#6B6B6B]" />
          </div>
          <h2 className="mt-[32px] text-[18px] font-medium uppercase leading-[24px] text-black">
            Your wishlist is empty
          </h2>
          <p className="mt-[10px] text-[14px] leading-[20px] text-[#1A1A1A]">
            Tap the heart on any product to save it here.
          </p>
          <div className="mt-[24px] flex w-[214px] flex-col gap-[12px]">
            <Link
              href="/men"
              className="flex h-[48px] items-center justify-center rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
            >
              Shop Mens
            </Link>
            <Link
              href="/women"
              className="flex h-[48px] items-center justify-center rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
            >
              Shop Womens
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-[24px] flex flex-col gap-[40px] lg:flex-row lg:gap-[56px]">
          {/* Sidebar */}
          <aside className="lg:w-[267px] lg:shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold uppercase leading-[26px] text-black">
                Filter &amp; sort
              </h2>
              <button
                type="button"
                onClick={clearAll}
                className="text-[15px] text-black underline underline-offset-[3px] hover:opacity-70"
              >
                Clear All
              </button>
            </div>

            <div className="mt-[28px]">
              <FilterSection
                title="Sort By"
                open={openSections.includes("sort")}
                onToggle={() => toggleSection("sort")}
              >
                {sortOptions.map((option) => (
                  <RadioOption
                    key={option.value}
                    label={option.label}
                    checked={sort === option.value}
                    onChange={() => setSort(option.value)}
                  />
                ))}
              </FilterSection>

              {filterSections
                .filter((section) => section.options.length > 0)
                .map((section) => (
                  <FilterSection
                    key={section.key}
                    title={
                      filters[section.key].length
                        ? `${section.title} (${filters[section.key].length})`
                        : section.title
                    }
                    open={openSections.includes(section.key)}
                    onToggle={() => toggleSection(section.key)}
                  >
                    {section.options.map((option) => (
                      <CheckboxOption
                        key={option.value}
                        label={option.label}
                        checked={filters[section.key].includes(option.value)}
                        onChange={() => toggleFilter(section.key, option.value)}
                      />
                    ))}
                  </FilterSection>
                ))}
            </div>
          </aside>

          {/* Products */}
          <div className="min-w-0 flex-1">
            {shown > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-[16px] gap-y-[40px]">
                {sortedRows.map(({ item, product }) => (
                  <WishlistPageCard key={item.id} item={item} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-[60px] text-center">
                <p className="text-[16px] text-[#1A1A1A]">No products match these filters.</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-[12px] text-[15px] text-black underline underline-offset-[3px] hover:opacity-70"
                >
                  Clear All
                </button>
              </div>
            )}

            <p className="mt-[60px] text-center text-[15px] text-[#6B6B6B]">
              Viewing {shown > 0 ? 1 : 0} - {shown} of {shown} {shown === 1 ? "product" : "products"}
            </p>

            <div className="mt-[56px] flex justify-center">
              <button
                type="button"
                onClick={clearItems}
                className="flex items-center gap-[8px] text-[16px] text-black underline underline-offset-[3px] hover:opacity-70"
              >
                <Trash2 strokeWidth={1.5} className="size-[18px]" />
                Remove all items
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}