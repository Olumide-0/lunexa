import Link from "next/link";
import { Hammer } from "lucide-react";

// Shown instead of a 404 for pages that are not built yet
export default function PageInProgress() {
  return (
    <section className="container mx-auto flex min-h-[60vh] w-11/12 flex-col items-center justify-center py-[80px] text-center">
      <div className="flex size-[72px] items-center justify-center rounded-full bg-[#EBEBEB]">
        <Hammer strokeWidth={1.5} className="size-[32px] text-black" />
      </div>
      <h1 className="mt-[24px] text-[24px] font-bold uppercase leading-[30px] text-black">
        Page in progress
      </h1>
      <p className="mt-[10px] max-w-[420px] text-[15px] leading-[22px] text-[#1A1A1A]">
        We&apos;re still working on this page and it isn&apos;t available at the moment. Please check back soon.
      </p>
      <div className="mt-[28px] flex flex-wrap justify-center gap-[8px]">
        <Link
          href="/"
          className="flex h-[48px] items-center rounded-full bg-black px-[28px] text-[15px] font-semibold text-white transition-colors hover:bg-[#333333]"
        >
          Back to home
        </Link>
        <Link
          href="/women"
          className="flex h-[48px] items-center rounded-full bg-[#EBEBEB] px-[28px] text-[15px] font-semibold text-black transition-colors hover:bg-[#DCDCDC]"
        >
          Shop Women
        </Link>
        <Link
          href="/men"
          className="flex h-[48px] items-center rounded-full bg-[#EBEBEB] px-[28px] text-[15px] font-semibold text-black transition-colors hover:bg-[#DCDCDC]"
        >
          Shop Men
        </Link>
      </div>
    </section>
  );
}