import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/admin";

async function NewProductContent() {
  await requireAdmin();

  return (
    <>
      <Link href="/admin/products" className="inline-flex items-center gap-[6px] text-[13px] text-[#6B6B6B] hover:text-black">
        <ArrowLeft strokeWidth={1.75} className="size-[16px]" />
        Back to products
      </Link>
      <h1 className="mb-[16px] mt-[8px] text-[24px] font-bold uppercase leading-[30px] text-black">Add product</h1>
      <ProductForm />
    </>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse bg-[#F2F2F2]" />}>
      <NewProductContent />
    </Suspense>
  );
}