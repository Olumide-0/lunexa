import AuthModal, { LogoutModal } from "@/components/auth/auth-modal";
import AnnouncementBar from "@/components/layout/announcement-bar";
import CartDrawer from "@/components/layout/cart-drawer";
import CurrencyRefresh from "@/components/layout/currency-refresh";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import WishlistModal from "@/components/layout/wishlist-modal";

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AnnouncementBar />
      {/* Everything that shows a price redraws when the currency changes */}
      <CurrencyRefresh>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WishlistModal />
        <CartDrawer />
      </CurrencyRefresh>
      <AuthModal />
      <LogoutModal />
    </>
  );
}