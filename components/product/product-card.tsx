"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice, productToWishlistItem } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";

export default function ProductCard({
  product,
  linkImage = true,
}: {
  product: Product;
  linkImage?: boolean; // false = clicking the image does nothing
}) {
  const wishlistItem = productToWishlistItem(product);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isSaved = useWishlistStore((state) =>
    state.items.some((saved) => saved.id === wishlistItem.id)
  );
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const openPopup = useWishlistStore((state) => state.openPopup);
  const addToCart = useCartStore((state) => state.addItem);
  const productHref = wishlistItem.href;

  // Signed out: ask them to sign in. Signed in: save / unsave.
  function handleHeartClick() {
    if (!isLoggedIn) {
      openPopup("card");
      return;
    }
    toggleItem(wishlistItem);
  }

  const showFilled = isLoggedIn && isSaved;

  const image = (
    <Image
      src={product.images[0]}
      alt={product.name}
      fill
      sizes="(min-width: 640px) 446px, 80vw"
      className="object-cover"
    />
  );

  return (
    <article className="group w-[80vw] shrink-0 snap-start sm:w-[446px]">
      <div className="relative aspect-[446/565] overflow-hidden rounded-[6px] bg-[#E8E4DF]">
        {linkImage ? (
          <Link href={productHref} aria-label={product.name} className="absolute inset-0">
            {image}
          </Link>
        ) : (
          image
        )}

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

        {/* Badge: hidden while hovering */}
        {product.badge && (
          <span className="absolute bottom-[25px] left-[15px] bg-white px-[11px] py-[6px] text-[15px] font-semibold uppercase leading-[20px] text-black transition-opacity duration-200 group-focus-within:opacity-0 group-hover:opacity-0">
            {product.badge}
          </span>
        )}

        {/* Size panel: shown while hovering. Clicking a size adds it to the bag. */}
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-5 gap-x-[12px] gap-y-[13px] bg-[#E8E8E8]/85 p-[22px] opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              aria-label={`Add ${product.name} size ${size} to bag`}
              onClick={() => addToCart(product, size)}
              className="flex h-[32px] items-center justify-center bg-white text-[15px] font-semibold uppercase text-black transition-colors hover:bg-black hover:text-white"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-[20px]">
        <h3 className="text-[17px] leading-[22px] text-[#1A1A1A]">
          <Link href={productHref} className="hover:underline">
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