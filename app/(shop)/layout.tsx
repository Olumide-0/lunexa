import { Suspense } from "react";
import AuthModal, { LogoutModal } from "@/components/auth/auth-modal";
import AnnouncementBar from "@/components/layout/announcement-bar";
import CartDrawer from "@/components/layout/cart-drawer";
import CurrencyRefresh from "@/components/layout/currency-refresh";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import WishlistModal from "@/components/layout/wishlist-modal";
import { getCollectionProducts } from "@/lib/products";

export default async function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // "People also bought" in the bag: 3 real products from the database
  const suggestions = (await getCollectionProducts("white-simmons")).slice(0, 3);

  return (
    <>
      <AnnouncementBar />
      {/* Everything that shows a price redraws when the currency changes */}
      <CurrencyRefresh>
        {/* The navbar reads the current URL. On pages whose URL isn't known ahead of time
            (like /orders/LX-...) that must happen inside <Suspense>. */}
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main>{children}</main>
        <Footer />
        <WishlistModal />
        <CartDrawer suggestions={suggestions} />
      </CurrencyRefresh>
      <AuthModal />
      <LogoutModal />
    </>
  );
}