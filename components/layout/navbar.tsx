"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import MegaMenu from "@/components/layout/mega-menu";
import SearchOverlay from "@/components/layout/search-overlay";
import { WishlistPanel } from "@/components/layout/wishlist-modal";
import { navMenus } from "@/data/navigation";
import { useAuthStore } from "@/store/auth-store";
import { selectCartCount, useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import logo from "../../public/images/image 14.png";

export default function Navbar() {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const openLogoutModal = useAuthStore((state) => state.openLogoutModal);
  const isPanelOpen = useWishlistStore((state) => state.popup === "navbar");
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const openPopup = useWishlistStore((state) => state.openPopup);
  const closePopup = useWishlistStore((state) => state.closePopup);
  const cartCount = useCartStore(selectCartCount);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // First name if we have it, otherwise the part of the email before "@"
  const displayName = user?.firstName || user?.email.split("@")[0] || "Account";

  // Only signed-in users can save, so only they see the wishlist count
  const showWishlistCount = isLoggedIn && wishlistCount > 0;
  const wishlistCountLabel = wishlistCount > 9 ? "9+" : String(wishlistCount);
  const cartCountLabel = cartCount > 9 ? "9+" : String(cartCount);

  // Heart is filled while the panel is open or while on the wishlist page
  const heartFilled = isPanelOpen || pathname === "/wishlist";

  // Load the saved sign-in, wishlist and bag from localStorage after the page mounts
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
  }, []);

  // Close the account dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!accountOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openMenu(label: string) {
    cancelClose();
    if (isPanelOpen) closePopup(); // don't show the wishlist panel and mega menu together
    setActiveMenu(label);
  }

  // Small delay so moving the mouse from the link to the panel doesn't close it
  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  }

  function closeMenu() {
    cancelClose();
    setActiveMenu(null);
  }

  // Open the search panel and close anything else that's open
  function openSearch() {
    closeMenu();
    if (isPanelOpen) closePopup();
    closeCart();
    setMobileOpen(false);
    setAccountOpen(false);
    setSearchOpen(true);
  }

  // Signed-out heart: open or close the "save to wishlist" panel
  function toggleWishlistPanel() {
    closeMenu();
    closeCart();
    if (isPanelOpen) {
      closePopup();
    } else {
      openPopup("navbar");
    }
  }

  // Signed-in heart: going to the wishlist page, so close anything open
  function goToWishlist() {
    closeMenu();
    closeCart();
    setMobileOpen(false);
  }

  // Bag: open the cart drawer and close the wishlist popups
  function handleCartClick() {
    closeMenu();
    closePopup();
    setAccountOpen(false);
    setMobileOpen(false);
    openCart();
  }

  // Close the mega menu with the Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setAccountOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentMenu = navMenus.find((menu) => menu.label === activeMenu);

  // Looks like an input, but opens the search panel
  const searchTrigger = (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search products"
      aria-expanded={searchOpen}
      className="flex h-[46px] w-full items-center gap-[12px] bg-[#DCDCDC] px-[14px] text-left lg:w-[232px]"
    >
      <Search strokeWidth={1.75} className="size-[20px] shrink-0 text-black" />
      <span className="truncate text-[15px] text-[#737373]">
        What are you looking for today?
      </span>
    </button>
  );

  const heartIcon = (
    <>
      <Heart strokeWidth={1.5} className={`size-[24px] ${heartFilled ? "fill-black" : ""}`} />
      {showWishlistCount && (
        <span className="absolute -right-[8px] -top-[6px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black px-[4px] text-[11px] font-semibold leading-none text-white">
          {wishlistCountLabel}
        </span>
      )}
    </>
  );

  const wishlistLabel = showWishlistCount
    ? `Wishlist, ${wishlistCount} item${wishlistCount === 1 ? "" : "s"}`
    : "Wishlist";

  return (
    <header className="sticky top-0 z-40 bg-[#EBEBEB]/70">
      <div className="mx-auto grid h-[72px] w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-[16px] lg:h-[103px] lg:px-[34px]">
        {/* Left: logo (desktop) / menu button (mobile) */}
        <div className="flex items-center">
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden"
          >
            {mobileOpen ? (
              <X strokeWidth={1.5} className="size-[24px]" />
            ) : (
              <Menu strokeWidth={1.5} className="size-[24px]" />
            )}
          </button>
          <Link href="/" aria-label="Lunexa home" className="hidden lg:block">
            <Image src={logo} alt="Lunexa" priority className="h-[40px] w-auto" />
          </Link>
        </div>

        {/* Center: nav links with mega menu (desktop) */}
        <nav className="hidden h-full items-center gap-[28px] self-stretch lg:flex">
          {navMenus.map((menu) => {
            const isActive = activeMenu === menu.label;
            return (
              <div
                key={menu.label}
                className="relative flex h-full items-center"
                onMouseEnter={() => openMenu(menu.label)}
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={menu.href}
                  aria-haspopup="true"
                  aria-expanded={isActive}
                  onFocus={() => openMenu(menu.label)}
                  onClick={closeMenu}
                  className="px-[15px] text-[18px] font-bold uppercase text-black"
                >
                  {menu.label}
                </Link>
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-[3px] bg-black" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Center: logo (mobile) */}
        <Link href="/" aria-label="Lunexa home" className="lg:hidden">
          <Image src={logo} alt="Lunexa" priority className="h-[32px] w-auto" />
        </Link>

        {/* Right: search + icons */}
        <div className="flex items-center justify-end gap-[20px] lg:gap-[22px]">
          <div className="hidden lg:block">{searchTrigger}</div>

          {/* Wishlist: page when signed in, panel when signed out */}
          {isLoggedIn ? (
            <Link
              href="/wishlist"
              aria-label={wishlistLabel}
              onClick={goToWishlist}
              className="relative hidden sm:block"
            >
              {heartIcon}
            </Link>
          ) : (
            <button
              type="button"
              aria-label={wishlistLabel}
              aria-expanded={isPanelOpen}
              onClick={toggleWishlistPanel}
              className="relative hidden sm:block"
            >
              {heartIcon}
            </button>
          )}

          {/* Account */}
          {isLoggedIn ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((prev) => !prev)}
                className="flex items-center gap-[4px] text-[16px] font-semibold capitalize text-black"
              >
                <span className="max-w-[100px] truncate">{displayName}</span>
                <ChevronDown
                  strokeWidth={1.75}
                  className={`size-[18px] transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full z-50 mt-[12px] w-[180px] rounded-[6px] bg-white py-[6px] shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      openLogoutModal();
                    }}
                    className="flex w-full items-center gap-[10px] px-[16px] py-[10px] text-left text-[15px] text-black hover:bg-[#F2F2F2]"
                  >
                    <LogOut strokeWidth={1.5} className="size-[18px]" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              aria-label="Log in"
              onClick={() => openAuthModal("login")}
              className="hidden sm:block"
            >
              <User strokeWidth={1.5} className="size-[24px]" />
            </button>
          )}

          {/* Bag */}
          <button
            type="button"
            aria-label={
              cartCount > 0 ? `Bag, ${cartCount} item${cartCount === 1 ? "" : "s"}` : "Bag"
            }
            onClick={handleCartClick}
            className="relative"
          >
            <ShoppingBag strokeWidth={1.5} className="size-[24px]" />
            {cartCount > 0 && (
              <span className="absolute -right-[8px] -top-[6px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black px-[4px] text-[11px] font-semibold leading-none text-white">
                {cartCountLabel}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop mega menu panel */}
      {currentMenu && (
        <MegaMenu
          key={currentMenu.label}
          menu={currentMenu}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onNavigate={closeMenu}
        />
      )}

      {/* Wishlist panel (signed out only) */}
      <WishlistPanel />

      {/* Search panel */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-[#D4D4D4] lg:hidden">
          <div className="w-11/12 container mx-auto px-[16px] pb-[24px] pt-[16px]">
            {searchTrigger}
            <nav className="mt-[16px] flex flex-col">
              {navMenus.map((menu) => (
                <Link
                  key={menu.href}
                  href={menu.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-[#D4D4D4] py-[14px] text-[16px] font-bold uppercase"
                >
                  {menu.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <Link
                  href="/wishlist"
                  onClick={goToWishlist}
                  className="border-b border-[#D4D4D4] py-[14px] text-[16px] font-bold uppercase"
                >
                  Wishlist{showWishlistCount ? ` (${wishlistCount})` : ""}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    toggleWishlistPanel();
                  }}
                  className="border-b border-[#D4D4D4] py-[14px] text-left text-[16px] font-bold uppercase"
                >
                  Wishlist
                </button>
              )}
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openLogoutModal();
                  }}
                  className="py-[14px] text-left text-[16px] font-bold uppercase"
                >
                  Log out ({displayName})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openAuthModal("login");
                  }}
                  className="py-[14px] text-left text-[16px] font-bold uppercase"
                >
                  Log in
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}