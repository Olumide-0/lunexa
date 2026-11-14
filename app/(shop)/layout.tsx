import { Suspense } from "react";
import AuthModal, { LogoutModal } from "@/components/auth/auth-modal";
import AnnouncementBar from "@/components/layout/announcement-bar";
import CartDrawer from "@/components/layout/cart-drawer";
import CurrencyRefresh from "@/components/layout/currency-refresh";
import Footer from "@/components/layout/footer";
import { HiddenPageGuard } from "@/components/layout/hidden-page-guard";
import Navbar from "@/components/layout/navbar";
import WishlistModal from "@/components/layout/wishlist-modal";
import { getHiddenPaths } from "@/lib/menu-visibility";
import { getCollectionProducts } from "@/lib/products";

export default async function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [collection, hiddenPaths] = await Promise.all([
    getCollectionProducts("white-simmons"),
    getHiddenPaths(), // menu items the admin has hidden (Admin → Categories)
  ]);
  // "People also bought" in the bag: 3 real products from the database
  const suggestions = collection.slice(0, 3);

  return (
    <>
      <AnnouncementBar />
      {/* Everything that shows a price redraws when the currency changes */}
      <CurrencyRefresh>
        {/* The navbar reads the current URL. On pages whose URL isn't known ahead of time
            (like /orders/LX-...) that must happen inside <Suspense>. */}
        <Suspense fallback={null}>
          <Navbar hiddenPaths={hiddenPaths} />
        </Suspense>
        <main>
          {/* Same reason: the guard reads the URL to know if this page is hidden */}
          <Suspense fallback={null}>
            <HiddenPageGuard hiddenPaths={hiddenPaths}>{children}</HiddenPageGuard>
          </Suspense>
        </main>
        <Footer />
        <WishlistModal />
        <CartDrawer suggestions={suggestions} />
      </CurrencyRefresh>
      <AuthModal />
      <LogoutModal />
    </>
  );
}