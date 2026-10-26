import type { Metadata } from "next";
import WishlistView from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist | Lunexa",
};

export default function WishlistPage() {
  return <WishlistView />;
}