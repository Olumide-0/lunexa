"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Heart, ShoppingBag, Star } from "lucide-react";
import type { ListingProduct } from "@/lib/products";
import { formatPrice, productToWishlistItem } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

/* ---------- One collapsible row (Description, Features...) ---------- */
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-[#E5E5E5]">
      <summary className="flex cursor-pointer list-none items-center justify-between py-[16px] text-[13px] font-bold uppercase leading-[18px] tracking-[0.02em] text-black [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown strokeWidth={1.5} className="size-[16px] transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-[18px] text-[14px] leading-[22px] text-[#3A3A3A]">{children}</div>
    </details>
  );
}

export default function ProductDetail({ product }: { product: ListingProduct }) {
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [sizeError, setSizeError] = useState(false);

  const addToCart = useCartStore((state) => state.addItem);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const wishlistItem = productToWishlistItem(product);
  const isSaved = useWishlistStore((state) => state.items.some((saved) => saved.id === wishlistItem.id));
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const openPopup = useWishlistStore((state) => state.openPopup);

  const soldOut = product.stock <= 0;
  const showFilled = isLoggedIn && isSaved;
  const discount =
    product.discount ??
    (product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : undefined);

  function handleAddToBag() {
    if (!size) {
      setSizeError(true); // "Please select a size"
      return;
    }
    addToCart(product, size); // adds one and opens the bag
  }

  // Signed out: ask them to sign in. Signed in: save / unsave.
  function handleHeartClick() {
    if (!isLoggedIn) {
      openPopup("card");
      return;
    }
    toggleItem(wishlistItem);
  }

  return (
    <section className="container mx-auto w-11/12">
      <div className="grid gap-[32px] lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-[64px]">
        {/* ---------- Gallery ---------- */}
        <div className="flex flex-col-reverse gap-[12px] lg:flex-row">
          {product.images.length > 1 && (
            <div className="flex gap-[8px] lg:w-[72px] lg:flex-col">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  onClick={() => setActiveImage(index)}
                  className={`relative aspect-[4/5] w-[56px] shrink-0 overflow-hidden rounded-[2px] bg-[#E8E4DF] lg:w-full ${
                    activeImage === index ? "ring-1 ring-black" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={image} alt="" fill sizes="72px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[4px] bg-[#E8E4DF]">
            <Image
              src={product.images[activeImage]}
              alt={`${product.name} - ${product.subtitle ?? ""}`}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            {product.badge && (
              <span className="absolute bottom-[14px] left-[14px] bg-white px-[8px] py-[4px] text-[11px] font-bold uppercase leading-[14px] text-black">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* ---------- Details ---------- */}
        <div className="lg:sticky lg:top-[120px] lg:self-start">
          <h1 className="text-[28px] font-bold uppercase leading-[34px] text-black lg:text-[32px] lg:leading-[38px]">
            {product.name}
          </h1>
          {product.subtitle && <p className="mt-[6px] text-[14px] leading-[20px] text-[#6B6B6B]">{product.subtitle}</p>}

          <p className="mt-[16px] flex items-center gap-[10px] text-[20px] font-bold leading-[26px] text-black">
            {formatPrice(product.price)}
            {product.compareAtPrice && (
              <span className="text-[16px] font-normal text-[#6B6B6B] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {discount ? (
              <span className="bg-black px-[6px] py-[3px] text-[11px] font-bold uppercase leading-[14px] text-white">
                -{discount}%
              </span>
            ) : null}
          </p>

          {product.reviewCount > 0 && (
            <div className="mt-[10px] flex items-center gap-[8px]">
              <div className="flex" aria-label={`Rated ${product.rating.toFixed(1)} out of 5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    strokeWidth={1.5}
                    className={`size-[14px] text-black ${star <= Math.round(product.rating) ? "fill-black" : ""}`}
                  />
                ))}
              </div>
              <span className="text-[12px] leading-[16px] text-[#6B6B6B]">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Colour */}
          {product.colors.length > 0 && (
            <div className="mt-[28px]">
              <p className="text-[13px] leading-[18px] text-black">
                <span className="font-bold uppercase">Colour:</span> {color}
              </p>
              <div className="mt-[10px] flex flex-wrap gap-[10px]">
                {product.colors.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    aria-label={item.name}
                    aria-pressed={color === item.name}
                    onClick={() => setColor(item.name)}
                    className={`size-[28px] rounded-full border border-[#D5D5D5] ${
                      color === item.name ? "outline outline-1 outline-offset-2 outline-black" : ""
                    }`}
                    style={{ backgroundColor: item.hex }} // runtime value from the database
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes.length > 0 && (
            <div className="mt-[24px]">
              <p className="text-[13px] leading-[18px] text-black">
                <span className="font-bold uppercase">Size:</span> {size ?? "Select a size"}
              </p>
              <div className="mt-[10px] flex flex-wrap gap-[8px]">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={size === item}
                    disabled={soldOut}
                    onClick={() => {
                      setSize(item);
                      setSizeError(false);
                    }}
                    className={`flex h-[40px] min-w-[52px] items-center justify-center rounded-[2px] border px-[12px] text-[13px] font-semibold leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      size === item
                        ? "border-black bg-black text-white"
                        : "border-[#D5D5D5] bg-white text-black hover:border-black"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p role="alert" className="mt-[8px] text-[12px] leading-[16px] text-[#C0392B]">
                  Please select a size
                </p>
              )}
            </div>
          )}

          {!soldOut && product.stock <= 10 && (
            <p className="mt-[16px] text-[12px] font-semibold leading-[16px] text-[#C0392B]">
              Only {product.stock} left in stock
            </p>
          )}

          {/* Add to bag + heart */}
          <div className="mt-[24px] flex gap-[10px]">
            <button
              type="button"
              disabled={soldOut}
              onClick={handleAddToBag}
              className="flex h-[52px] flex-1 items-center justify-center gap-[10px] rounded-[2px] bg-black text-[14px] font-bold uppercase leading-none text-white transition-colors hover:bg-[#222] disabled:cursor-not-allowed disabled:bg-[#9A9A9A]"
            >
              <ShoppingBag strokeWidth={1.5} className="size-[18px]" />
              {soldOut ? "Sold out" : "Add to bag"}
            </button>
            <button
              type="button"
              aria-label={showFilled ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={showFilled}
              onClick={handleHeartClick}
              className="flex size-[52px] items-center justify-center rounded-[2px] border border-[#D5D5D5] bg-white transition-colors hover:border-black"
            >
              <Heart strokeWidth={1.5} className={`size-[20px] text-black ${showFilled ? "fill-black" : ""}`} />
            </button>
          </div>

          {/* Accordions */}
          <div className="mt-[32px] border-t border-[#E5E5E5]">
            <Accordion title="Description">{product.description}</Accordion>

            {product.features && product.features.length > 0 && (
              <Accordion title="Features">
                <ul className="list-disc space-y-[4px] pl-[18px]">
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </Accordion>
            )}

            {(product.fit || product.pattern || product.collection) && (
              <Accordion title="Details">
                <ul className="space-y-[4px]">
                  {product.fit && <li>Fit: {product.fit}</li>}
                  {product.pattern && <li>Pattern: {product.pattern}</li>}
                  {product.collection && <li>Collection: {product.collection}</li>}
                </ul>
              </Accordion>
            )}

            {/* Placeholder text: replace with your real delivery and returns policy */}
            <Accordion title="Delivery & returns">
              Delivery times and costs are shown at checkout. Contact us if you need help with an order or a return.
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}