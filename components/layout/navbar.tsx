"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
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

  // ----- Local UI state -----
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // ----- Stores -----
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const openLogoutModal = useAuthStore((state) => state.openLogoutModal);

  const wishlistCount = useWishlistStore((state) => state.items.length);
  const wishlistPopup = useWishlistStore((state) => state.popup);
  const openWishlistPopup = useWishlistStore((state) => state.openPopup);
  const closeWishlistPopup = useWishlistStore((state) => state.closePopup);

  const cartCount = useCartStore(selectCartCount);
  const openCart = useCartStore((state) => state.openCart);

  // Load the saved auth, wishlist and cart from localStorage once the page is in the browser.
  // (The stores use skipHydration, so the server and first browser render match.)
  useEffect(() => {
    Promise.all([
      useAuthStore.persist.rehydrate(),
      useWishlistStore.persist.rehydrate(),
      useCartStore.persist.rehydrate(),
    ]).then(() => setHydrated(true));
  }, []);

  // ----- Mega menu (hover) -----
  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openMenu(label: string) {
    cancelClose();
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

  // Escape closes the mega menu and the account dropdown
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

  // Clicking anywhere outside the account dropdown closes it
  useEffect(() => {
    if (!accountOpen) return;
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [accountOpen]);

  const currentMenu = navMenus.find((menu) => menu.label === activeMenu);

  // Only trust the stores after they've loaded (avoids a "signed out" flash)
  const signedIn = hydrated && isLoggedIn;
  const onWishlistPage = pathname === "/wishlist";

  // Signed out: the heart opens the small wishlist panel (toggle)
  function handleWishlistPanel() {
    if (wishlistPopup === "navbar") closeWishlistPopup();
    else openWishlistPopup("navbar");
  }

  function handleLogout() {
    setAccountOpen(false);
    setMobileOpen(false);
    openLogoutModal();
  }

  function handleLogin() {
    setMobileOpen(false);
    openAuthModal("login");
  }

  return (
    <header className="sticky top-0 z-40 bg-[#EBEBEB]/70">
      <div className="grid h-[72px] w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-[16px] lg:h-[85px] lg:px-[34px]">
        {/* Left: logo (desktop) / menu button (mobile) */}
        <div className="flex items-center">
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
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
            <Image src={logo} alt="Lunexa" priority className="h-auto w-[106px]" />
          </Link>
        </div>

        {/* Center: nav links with mega menu (desktop) */}
        <nav className="hidden h-full items-center gap-[51px] self-stretch lg:flex">
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
                  className="text-[16px] font-bold uppercase leading-[20px] text-black"
                >
                  {menu.label}
                </Link>
                {isActive && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-black" />}
              </div>
            );
          })}
        </nav>

        {/* Center: logo (mobile) */}
        <Link href="/" aria-label="Lunexa home" className="lg:hidden">
          <Image src={logo} alt="Lunexa" priority className="h-[32px] w-auto" />
        </Link>

        {/* Right: search + icons */}
        <div className="flex items-center justify-end gap-[16px] lg:gap-[24px]">
          {/* Search trigger (desktop) — opens the search overlay */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className="hidden h-[46px] w-[232px] shrink-0 items-center gap-[12px] bg-[#D4D4D4] px-[14px] text-left lg:flex"
          >
            <Search strokeWidth={1.75} className="size-[20px] shrink-0 text-black" />
            <span className="truncate text-[15px] leading-[20px] text-[#6B6B6B]">
              What are you looking for today?
            </span>
          </button>

          {/* Search icon (mobile) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className="lg:hidden"
          >
            <Search strokeWidth={1.5} className="size-[20px]" />
          </button>

          {/* Wishlist */}
          {signedIn ? (
            <Link href="/wishlist" aria-label={`Wishlist (${wishlistCount})`} className="relative hidden sm:block">
              <Heart
                strokeWidth={1.5}
                className={`size-[20px] text-black ${onWishlistPage ? "fill-black" : ""}`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -right-[8px] -top-[8px] flex size-[16px] items-center justify-center rounded-full bg-black text-[10px] font-semibold leading-none text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Wishlist"
              aria-expanded={wishlistPopup === "navbar"}
              onClick={handleWishlistPanel}
              className="hidden sm:block"
            >
              <Heart strokeWidth={1.5} className="size-[20px] text-black" />
            </button>
          )}

          {/* Account */}
          {signedIn ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((prev) => !prev)}
                className="flex items-center gap-[6px]"
              >
                <span className="max-w-[118px] truncate text-[16px] font-semibold leading-[20px] text-black">
                  {user?.firstName || user?.email}
                </span>
                <ChevronDown
                  strokeWidth={1.75}
                  className={`size-[16px] text-black transition-transform ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+12px)] w-[180px] rounded-[4px] bg-white py-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-[10px] px-[16px] py-[10px] text-[14px] text-black hover:bg-[#F2F2F2]"
                  >
                    <LogOut strokeWidth={1.5} className="size-[16px]" />
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
              <User strokeWidth={1.5} className="size-[20px] text-black" />
            </button>
          )}

          {/* Bag */}
          <button type="button" aria-label={`Bag (${cartCount})`} onClick={openCart} className="relative">
            <ShoppingBag strokeWidth={1.5} className="size-[20px] text-black" />
            {hydrated && cartCount > 0 && (
              <span className="absolute -right-[8px] -top-[8px] flex size-[16px] items-center justify-center rounded-full bg-black text-[10px] font-semibold leading-none text-white">
                {cartCount > 99 ? "99+" : cartCount}
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

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-[#D4D4D4] px-[16px] pb-[24px] pt-[8px] lg:hidden">
          <nav className="flex flex-col">
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
            {signedIn ? (
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="border-b border-[#D4D4D4] py-[14px] text-left text-[16px] font-bold uppercase"
              >
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openWishlistPopup("navbar");
                }}
                className="border-b border-[#D4D4D4] py-[14px] text-left text-[16px] font-bold uppercase"
              >
                Wishlist
              </button>
            )}
            <button
              type="button"
              onClick={signedIn ? handleLogout : handleLogin}
              className="py-[14px] text-left text-[16px] font-bold uppercase"
            >
              {signedIn ? "Log out" : "Log in"}
            </button>
          </nav>
        </div>
      )}

      {/* Search overlay + signed-out wishlist panel */}
      {searchOpen && <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />}
      <WishlistPanel />
    </header>
  );
}