import type { Metadata } from "next";
import { Suspense } from "react";
import TrackOrder from "@/components/orders/track-order";

export const metadata: Metadata = {
  title: "Track your order | Lunexa",
};

// TrackOrder reads the "?order=" part of the URL, so it sits inside <Suspense>
export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container mx-auto h-[400px] w-11/12 animate-pulse bg-[#F2F2F2]" />}>
      <TrackOrder />
    </Suspense>
  );
}