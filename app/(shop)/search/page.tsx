import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/search/search-results";
import { searchProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Search | Lunexa",
};

// Reads ?q= and asks the database. Kept in its own component so the page shell can load first.
async function Results({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? "";
  const products = query ? await searchProducts(query, 60) : [];

  return <SearchResults query={query} products={products} />;
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  return (
    <main className="container mx-auto w-11/12 pb-[100px] pt-[40px]">
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}