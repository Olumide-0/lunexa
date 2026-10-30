"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Heart, Search, X } from "lucide-react";
import { formatPrice, productToWishlistItem } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";

type TrendingLink = {
  label: string;
  href?: string; // no href = not available in store
};

// "#" links scroll to a section with that id
const trendingLinks: TrendingLink[] = [
  { label: "Whitney", href: "/#white-simmons" },
  { label: "Pink Gym Sets", href: "/#popular-right-now" },
  { label: "Men Shorts", href: "/men#new-in-shorts" },
  { label: "Socks" },
];

/* ---------- Small product card ---------- */
function SearchProductCard({ product, onNavigate }: { product: Product; onNavigate: () => void }) {
  const wishlistItem = productToWishlistItem(product);
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
    <article className="w-[207px] shrink-0">
      <div className="relative aspect-[207/262] overflow-hidden rounded-[4px] bg-[#E8E4DF]">
        {/* Image is not a link */}
        <Image src={product.images[0]} alt={product.name} fill sizes="207px" className="object-cover" />
        <button
          type="button"
          aria-label={showFilled ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={showFilled}
          onClick={handleHeartClick}
          className="absolute right-[10px] top-[10px] flex size-[20px] items-center justify-center rounded-full bg-white"
        >
          <Heart
            strokeWidth={1.5}
            className={`size-[10px] text-black ${showFilled ? "fill-black" : ""}`}
          />
        </button>
        {product.badge && (
          <span className="absolute bottom-[12px] left-[8px] bg-white px-[6px] py-[3px] text-[12px] font-semibold uppercase leading-[16px] text-black">
            {product.badge}
          </span>
        )}
      </div>
      <h3 className="mt-[12px] text-[15px] leading-[20px] text-[#1A1A1A]">
        <Link href={wishlistItem.href} onClick={onNavigate} className="hover:underline">
          {product.name}
        </Link>
      </h3>
      {product.subtitle && (
        <p className="mt-[4px] text-[12px] leading-[16px] text-[#6B6B6B]">{product.subtitle}</p>
      )}
      <p className="mt-[6px] text-[13px] font-semibold leading-[18px] text-black">
        {formatPrice(product.price)}
      </p>
    </article>
  );
}

/* ---------- Search panel ---------- */
export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showUnavailable, setShowUnavailable] = useState<string | null>(null);
  const [top, setTop] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [popular, setPopular] = useState<Product[]>([]); // shown before typing
  const [results, setResults] = useState<Product[]>([]); // shown while searching
  const [loading, setLoading] = useState(false);

  // Clear the text/messages and close
  function close() {
    setQuery("");
    setShowUnavailable(null);
    onClose();
  }

  // Start the panel just below the black top bar (follows it as the page scrolls),
  // and put the cursor in the search input
  useLayoutEffect(() => {
    if (!open) return;

    function updateTop() {
      const header = document.querySelector("header");
      setTop(header ? Math.max(0, header.getBoundingClientRect().top) : 0);
    }

    updateTop();
    inputRef.current?.focus();
    window.addEventListener("scroll", updateTop, { passive: true });
    window.addEventListener("resize", updateTop);

    return () => {
      window.removeEventListener("scroll", updateTop);
      window.removeEventListener("resize", updateTop);
    };
  }, [open]);

  // Close with the Escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setQuery("");
        setShowUnavailable(null);
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Ask the database. Empty box = popular products, otherwise search (waits 250ms after typing stops)
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    const controller = new AbortController();

    const timer = setTimeout(
      async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`, {
            signal: controller.signal,
          });
          const data: { products: Product[] } = res.ok ? await res.json() : { products: [] };
          if (q) setResults(data.products);
          else setPopular(data.products);
        } catch {
          // aborted because the person kept typing, or the network failed: nothing to do
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      },
      q ? 250 : 0
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  if (!open) return null;

  const isSearching = query.trim().length > 0;
  const shown = isSearching ? results : popular;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser from reloading the page
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    close();
  }

  return (
    <div
      style={{ top }}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-x-0 z-50 h-[811px] max-h-[calc(100vh-68px)] overflow-y-auto bg-[#F7F7F7]/95"
    >
      <div className="relative mx-auto w-full max-w-[1440px] px-[16px] pb-[60px] pt-[30px] lg:px-[34px]">
        {/* Close */}
        <button
          type="button"
          aria-label="Close search"
          onClick={close}
          className="absolute right-[16px] top-[38px] text-black transition-opacity hover:opacity-60 lg:right-[40px]"
        >
          <X strokeWidth={1.5} className="size-[28px]" />
        </button>

        {/* Search input */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="mx-auto flex h-[46px] w-[calc(100%-56px)] max-w-[440px] items-center gap-[12px] bg-[#DCDCDC] px-[14px]"
        >
          <Search strokeWidth={1.75} className="size-[20px] shrink-0 text-black" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for today"
            aria-label="Search products"
            className="w-full bg-transparent text-[15px] text-black outline-none placeholder:text-[#737373]"
          />
        </form>

        <div className="mt-[60px] flex flex-col gap-[40px] lg:flex-row lg:gap-0 lg:pl-[236px]">
          {/* Trending */}
          <div className="lg:w-[232px] lg:shrink-0">
            <h2 className="text-[20px] font-bold uppercase leading-[24px] text-black">
              Trending
            </h2>
            <ul className="mt-[30px] flex flex-col gap-[25px]">
              {trendingLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      onClick={close}
                      className="text-[18px] leading-[22px] text-black hover:underline"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowUnavailable(link.label)}
                        aria-describedby={
                          showUnavailable === link.label ? "unavailable-message" : undefined
                        }
                        className="text-left text-[18px] leading-[22px] text-black hover:underline"
                      >
                        {link.label}
                      </button>
                      {showUnavailable === link.label && (
                        <p
                          id="unavailable-message"
                          role="status"
                          className="mt-[6px] text-[14px] leading-[20px] text-[#6B6B6B]"
                        >
                          Not available in store
                        </p>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Popular products / results */}
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-bold uppercase leading-[24px] text-black">
              {isSearching
                ? `Results for “${query.trim()}” (${shown.length})`
                : "Popular products"}
            </h2>

            {shown.length > 0 ? (
              <div
                className={`mt-[30px] flex gap-[10px] ${
                  isSearching ? "flex-wrap gap-y-[28px]" : "no-scrollbar overflow-x-auto"
                }`}
              >
                {shown.map((product) => (
                  <SearchProductCard key={product.id} product={product} onNavigate={close} />
                ))}
              </div>
            ) : (
              <p className="mt-[30px] text-[16px] text-[#6B6B6B]">
                {loading ? "Searching…" : "No products found. Try a different search."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}