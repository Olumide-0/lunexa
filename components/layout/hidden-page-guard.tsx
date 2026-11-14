"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isPathHidden } from "@/lib/menu-paths";

// If the admin has hidden this page (or its whole category), show a message instead of the page
export function HiddenPageGuard({ hiddenPaths, children }: { hiddenPaths: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  if (!isPathHidden(pathname, hiddenPaths)) return children;

  return (
    <section className="container mx-auto w-11/12 py-[96px] text-center">
      <h1 className="text-[28px] font-bold uppercase leading-[34px] text-black">This page isn&apos;t available</h1>
      <p className="mx-auto mt-[12px] max-w-[420px] text-[15px] leading-[22px] text-[#6B6B6B]">
        This section of the store is not available right now. Have a look at the rest of the store instead.
      </p>
      <Link
        href="/"
        className="mt-[28px] inline-flex h-[48px] items-center rounded-full bg-black px-[32px] text-[15px] font-semibold text-white transition-opacity hover:opacity-80"
      >
        Back to store
      </Link>
    </section>
  );
}