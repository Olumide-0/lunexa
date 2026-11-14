import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/admin";
import { getProductBySlug } from "@/lib/products";

async function EditProductContent({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();

  const { slug } = await params;
  // Not the cached one (the admin always sees the latest), and hidden products are included
  const product = await getProductBySlug(slug, { includeHidden: true });
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className="inline-flex items-center gap-[6px] text-[13px] text-[#6B6B6B] hover:text-black">
        <ArrowLeft strokeWidth={1.75} className="size-[16px]" />
        Back to products
      </Link>
      <h1 className="mb-[16px] mt-[8px] text-[24px] font-bold uppercase leading-[30px] text-black">Edit product</h1>
      <ProductForm product={product} />
    </>
  );
}

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse bg-[#F2F2F2]" />}>
      <EditProductContent params={params} />
    </Suspense>
  );
}