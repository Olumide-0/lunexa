import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductCarousel from "@/components/home/product-carousel";
import ProductDetail from "@/components/product/product-detail";
import {
  getCachedProductBySlug,
  getCollectionProducts,
  getSubcategoryProducts,
  queryProducts,
} from "@/lib/products";

// Pre-builds a page for every product. A slug that isn't here still works on demand,
// and a slug that isn't in the database hits notFound() below.
export async function generateStaticParams() {
  const products = await queryProducts();
  return products.map((product) => ({ slug: product.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} - ${product.subtitle ?? "Lunexa"} | Lunexa`,
    description: product.description,
  };
}

// The part that reads the URL and the database. It sits inside <Suspense> (below)
// so Next.js can show the page shell instantly.
async function ProductContent({ params }: Props) {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);
  if (!product) notFound();

  // "You may also like": other products from the same collection (or subcategory)
  const pool = product.collection
    ? await getCollectionProducts(product.collection)
    : product.subcategory
      ? await getSubcategoryProducts(product.subcategory)
      : [];
  const related = pool.filter((item) => item.slug !== product.slug).slice(0, 8);

  const audience = product.category === "men" ? "Men" : product.category === "women" ? "Women" : "Accessories";

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="container mx-auto w-11/12 pb-[16px] pt-[24px] text-[12px] leading-[16px] text-[#6B6B6B]">
        <Link href={`/${product.category}`} className="hover:text-black">
          {audience}
        </Link>
        <span className="mx-[8px]">/</span>
        <span className="text-black">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-[64px] pb-[64px]">
          <ProductCarousel title="You may also like" products={related} />
        </section>
      )}
    </>
  );
}

// Shown for a split second while ProductContent loads.
function ProductFallback() {
  return (
    <div className="container mx-auto w-11/12 py-[40px]">
      <div className="grid gap-[32px] lg:grid-cols-2">
        <div className="aspect-[4/5] w-full animate-pulse rounded-[4px] bg-[#E8E4DF]" />
        <div className="space-y-[16px]">
          <div className="h-[32px] w-2/3 animate-pulse bg-[#E8E4DF]" />
          <div className="h-[20px] w-1/3 animate-pulse bg-[#E8E4DF]" />
          <div className="h-[20px] w-1/4 animate-pulse bg-[#E8E4DF]" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductFallback />}>
      <ProductContent params={params} />
    </Suspense>
  );
}