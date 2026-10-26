"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Heart, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
// Placeholders: replace with the real modal images
import womenImg from "../../public/images/Frame 7 (9).png";
import menImg from "../../public/images/Frame 7 (4).png";

/* ---------- Shared: Create Account / Log In buttons ---------- */
function AuthButtons({ onClose, large }: { onClose: () => void; large?: boolean }) {
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const size = large ? "h-[48px] px-[24px] text-[16px]" : "h-[38px] px-[18px] text-[14px]";

  // Close the wishlist popup, then open the log in / sign up modal
  function open(view: "login" | "register") {
    onClose();
    openAuthModal(view);
  }

  return (
    <div className="flex gap-[8px]">
      <button
        type="button"
        onClick={() => open("register")}
        className={`flex items-center rounded-full bg-black font-semibold text-white transition-colors hover:bg-[#333333] ${size}`}
      >
        Create Account
      </button>
      <button
        type="button"
        onClick={() => open("login")}
        className={`flex items-center rounded-full bg-[#EBEBEB] font-semibold text-black transition-colors hover:bg-[#DCDCDC] ${size}`}
      >
        Log In
      </button>
    </div>
  );
}

/* ---------- Card modal: opened from a product / collection heart (signed out) ---------- */
export default function WishlistModal() {
  const isOpen = useWishlistStore((state) => state.popup === "card");
  const close = useWishlistStore((state) => state.closePopup);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Close with the Escape key
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);

    // Stop the page behind the modal from scrolling
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move keyboard focus into the modal
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-[16px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[706px] overflow-hidden rounded-[12px] bg-white"
      >
        {/* Header */}
        <div className="relative flex h-[83px] items-center justify-center px-[60px]">
          <div className="flex items-center gap-[12px]">
            <Heart strokeWidth={1.5} className="size-[20px] fill-black text-black" />
            <h2
              id="wishlist-modal-title"
              className="text-[16px] font-bold uppercase leading-[20px] text-black"
            >
              Save to wishlist
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-[28px] top-1/2 -translate-y-1/2 text-black transition-opacity hover:opacity-60"
          >
            <X strokeWidth={1.5} className="size-[24px]" />
          </button>
        </div>

        {/* Images */}
        <div className="grid h-[160px] grid-cols-2 sm:h-[217px]">
          <div className="relative">
            <Image
              src={womenImg}
              alt="Woman wearing a white sports bra"
              fill
              sizes="353px"
              className="object-cover"
            />
          </div>
          <div className="relative">
            <Image
              src={menImg}
              alt="Man wearing an oversized grey sweatshirt"
              fill
              sizes="353px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center px-[24px] pb-[37px] pt-[26px] text-center">
          <p className="max-w-[540px] text-[15px] leading-[22px] text-black">
            Ever wish you could save all your fave fits &amp; accessories in one place to come
            back to later? Almost like a ✨ wishlist ✨.
          </p>
          <div className="mt-[20px]">
            <AuthButtons onClose={close} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Navbar panel: opened from the navbar heart (signed out) ---------- */
export function WishlistPanel() {
  const isOpen = useWishlistStore((state) => state.popup === "navbar");
  const close = useWishlistStore((state) => state.closePopup);

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
    <div className="absolute left-0 top-full w-full bg-[#F7F7F7]/95">
      <div className="w-11/12 container mx-auto relative flex h-[560px] max-h-[calc(100vh-72px)] flex-col items-center justify-center px-[16px] pb-[120px] text-center lg:h-[730px] lg:max-h-[calc(100vh-103px)]">
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-[16px] top-[28px] text-black transition-opacity hover:opacity-60 lg:right-[38px]"
        >
          <X strokeWidth={1.5} className="size-[28px]" />
        </button>

        <div className="flex items-center gap-[14px]">
          <Heart strokeWidth={1.5} className="size-[26px] fill-black text-black" />
          <h2 className="text-[20px] font-bold uppercase leading-[24px] text-black">
            Save to wishlist
          </h2>
        </div>
        <p className="mt-[24px] max-w-[690px] text-[17px] leading-[28px] text-black">
          Ever wish you could save all your fave fits &amp; accessories in one place to come
          back to later? Almost like a ✨ wishlist ✨.
        </p>
        <div className="mt-[34px]">
          <AuthButtons onClose={close} large />
        </div>
      </div>
    </div>
  );
}