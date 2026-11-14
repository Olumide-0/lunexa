import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin access only | Lunexa",
  robots: { index: false, follow: false },
};

export default function AdminOnlyPage() {
  return (
    <main className="container mx-auto flex w-11/12 flex-col items-center py-[80px] text-center">
      <ShieldAlert strokeWidth={1.5} className="size-[48px] text-black" />
      <h1 className="mt-[16px] text-[28px] font-bold uppercase leading-[34px] text-black">Admin access only</h1>
      <p className="mt-[8px] max-w-[420px] text-[14px] leading-[22px] text-[#6B6B6B]">
        This area is for Lunexa admins. If you are an admin, sign in with your admin account and try again.
      </p>
      <Link
        href="/"
        className="mt-[24px] flex h-[44px] items-center rounded-full bg-black px-[28px] text-[14px] font-semibold text-white transition-colors hover:bg-[#1F1F1F]"
      >
        Back to store
      </Link>
    </main>
  );
}