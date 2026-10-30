"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export function SearchResults({ query, products }: { query: string; products: Product[] }) {
  if (!query) {
    return (
      <div className="py-[80px] text-center">
        <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">Search</h1>
        <p className="mt-[10px] text-[15px] text-[#6B6B6B]">
          Type what you are looking for in the search bar.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">
        Results for “{query}”
      </h1>
      <p className="mt-[6px] text-[14px] text-[#6B6B6B]">
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>

      {products.length === 0 ? (
        <div className="py-[60px] text-center">
          <p className="text-[16px] text-[#1A1A1A]">No products found. Try a different search.</p>
          <div className="mt-[20px] flex justify-center gap-[8px]">
            <Link
              href="/women"
              className="flex h-[44px] items-center rounded-full bg-black px-[20px] text-[15px] font-semibold text-white transition-colors hover:bg-[#333333]"
            >
              Shop Womens
            </Link>
            <Link
              href="/men"
              className="flex h-[44px] items-center rounded-full bg-black px-[20px] text-[15px] font-semibold text-white transition-colors hover:bg-[#333333]"
            >
              Shop Mens
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-[30px] grid grid-cols-2 gap-x-[12px] gap-y-[32px] md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <article key={product.id}>
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-[250/312] overflow-hidden bg-[#E8E4DF]">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                  {product.badge && (
                    <span className="pointer-events-none absolute bottom-[12px] left-[8px] bg-white px-[7px] py-[3px] text-[12px] font-semibold uppercase leading-[16px] text-black">
                      {product.badge}
                    </span>
                  )}
                </div>
                <h2 className="mt-[12px] text-[15px] leading-[20px] text-[#1A1A1A] hover:underline">
                  {product.name}
                </h2>
              </Link>
              {product.subtitle && (
                <p className="mt-[4px] text-[13px] leading-[18px] text-[#6B6B6B]">
                  {product.subtitle}
                </p>
              )}
              <p className="mt-[6px] text-[14px] font-semibold leading-[18px] text-black">
                {formatPrice(product.price)}
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}