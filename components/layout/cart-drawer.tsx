"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { formatPrice, productToWishlistItem } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { selectCartCount, selectCartSubtotal, useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";

/* ---------- Small product card for "People also bought" ---------- */
function CartSuggestionCard({ product, onNavigate }: { product: Product; onNavigate: () => void }) {
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
    <article className="w-[206px] shrink-0">
      <div className="relative aspect-[206/262] overflow-hidden rounded-[4px] bg-[#E8E4DF]">
        <Link href={wishlistItem.href} onClick={onNavigate} aria-label={product.name} className="absolute inset-0">
          <Image src={product.images[0]} alt={product.name} fill sizes="206px" className="object-cover" />
        </Link>
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
      <h3 className="mt-[12px] text-[15px] leading-[20px] text-[#1A1A1A]">{product.name}</h3>
      {product.subtitle && (
        <p className="mt-[4px] text-[12px] leading-[16px] text-[#6B6B6B]">{product.subtitle}</p>
      )}
      <p className="mt-[6px] text-[13px] font-semibold leading-[18px] text-black">
        {formatPrice(product.price)}
      </p>
    </article>
  );
}

/* ---------- Cart drawer ---------- */
// `suggestions` = the "People also bought" products, passed in by the shop layout (from MongoDB)
export default function CartDrawer({ suggestions }: { suggestions: Product[] }) {
  const router = useRouter();
  const isOpen = useCartStore((state) => state.isOpen);
  const close = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const [top, setTop] = useState(0);

  // Guests can use the bag freely, but must sign in before checking out
  function handleCheckout() {
    close();
    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }
    router.push("/checkout");
  }

  // Start the drawer just below the black top bar (follows it as the page scrolls)
  useLayoutEffect(() => {
    if (!isOpen) return;

    function updateTop() {
      const header = document.querySelector("header");
      setTop(header ? Math.max(0, header.getBoundingClientRect().top) : 0);
    }

    updateTop();
    window.addEventListener("scroll", updateTop, { passive: true });
    window.addEventListener("resize", updateTop);

    return () => {
      window.removeEventListener("scroll", updateTop);
      window.removeEventListener("resize", updateTop);
    };
  }, [isOpen]);

  // Close with the Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div style={{ top }} className="fixed inset-x-0 z-50 flex h-[850px] max-h-[calc(100vh-68px)]">
      {/* Left: overlay + People also bought (desktop only). Clicking empty space closes. */}
      <div onClick={close} className="relative hidden flex-1 bg-[#F7F7F7]/95 lg:block">
        <div onClick={(e) => e.stopPropagation()} className="absolute left-[80px] top-[56px]">
          <h2 className="text-[20px] font-bold uppercase leading-[24px] text-black">
            People also bought
          </h2>
          <div className="mt-[36px] flex gap-[10px]">
            {suggestions.map((product) => (
              <CartSuggestionCard key={product.id} product={product} onNavigate={close} />
            ))}
          </div>
        </div>
      </div>

      {/* Right: the drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="relative flex h-full w-full flex-col bg-white shadow-[0_8px_40px_rgba(0,0,0,0.18)] lg:w-[480px]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-[28px] top-[24px] z-10 text-black transition-opacity hover:opacity-60"
        >
          <X strokeWidth={1.5} className="size-[28px]" />
        </button>

        {items.length === 0 ? (
          /* Empty state (from the design) */
          <div className="flex flex-1 flex-col items-center justify-center px-[24px] pb-[60px] text-center">
            <div className="flex size-[96px] items-center justify-center rounded-full bg-[#EBEBEB]">
              <ShoppingBag strokeWidth={1} className="size-[60px] fill-[#6B6B6B] text-[#EBEBEB]" />
            </div>
            <h2 className="mt-[32px] text-[18px] font-medium uppercase leading-[24px] text-black">
              Your bag is empty
            </h2>
            <p className="mt-[10px] text-[14px] leading-[20px] text-[#1A1A1A]">
              There are no products in your bag
            </p>
            <div className="mt-[24px] flex w-[214px] flex-col gap-[12px]">
              <Link
                href="/men"
                onClick={close}
                className="flex h-[48px] items-center justify-center rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
              >
                Shop Mens
              </Link>
              <Link
                href="/women"
                onClick={close}
                className="flex h-[48px] items-center justify-center rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
              >
                Shop Womens
              </Link>
            </div>
          </div>
        ) : (
          /* Items in the bag */
          <div className="flex h-full min-h-0 flex-col">
            <h2 className="px-[24px] pr-[64px] pt-[28px] text-[18px] font-bold uppercase leading-[24px] text-black">
              Your bag ({count})
            </h2>

            <ul className="mt-[20px] min-h-0 flex-1 divide-y divide-[#E5E5E5] overflow-y-auto px-[24px]">
              {items.map((item) => (
                <li key={item.key} className="flex gap-[16px] py-[16px]">
                  <Link
                    href={item.href}
                    onClick={close}
                    className="relative h-[120px] w-[96px] shrink-0 overflow-hidden rounded-[4px] bg-[#E8E8E8]"
                  >
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-[12px]">
                      <Link
                        href={item.href}
                        onClick={close}
                        className="text-[15px] font-semibold leading-[20px] text-black hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="shrink-0 text-[14px] font-semibold leading-[20px] text-black">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    {item.subtitle && (
                      <p className="mt-[4px] text-[13px] leading-[18px] text-[#6B6B6B]">
                        {item.subtitle}
                      </p>
                    )}
                    <p className="mt-[2px] text-[13px] leading-[18px] text-[#6B6B6B]">
                      Size: {item.size}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex h-[34px] items-center rounded-full border border-[#CFCFCF]">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="flex size-[34px] items-center justify-center text-black hover:opacity-60"
                        >
                          <Minus strokeWidth={1.75} className="size-[14px]" />
                        </button>
                        <span aria-live="polite" className="w-[24px] text-center text-[14px] font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          disabled={item.quantity >= item.maxQuantity}
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="flex size-[34px] items-center justify-center text-black hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Plus strokeWidth={1.75} className="size-[14px]" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-[13px] text-black underline underline-offset-[2px] hover:opacity-70"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <div className="border-t border-[#E5E5E5] px-[24px] pb-[28px] pt-[20px]">
              <div className="flex items-center justify-between text-[16px] font-semibold text-black">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-[6px] text-[13px] leading-[18px] text-[#6B6B6B]">
                Shipping and taxes are calculated at checkout.
              </p>
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-[16px] flex h-[48px] w-full items-center justify-center rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}