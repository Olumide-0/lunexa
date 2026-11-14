import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Types } from "mongoose";
import { Plus, Search } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { Product, type ProductDoc } from "@/models/Product";

type ProductLean = ProductDoc & { _id: Types.ObjectId };
type SearchParams = Promise<{ q?: string | string[]; page?: string | string[] }>;

const PAGE_SIZE = 20;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function ProductsContent({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const q = (first(params.q) ?? "").trim().slice(0, 60);
  const page = Math.max(1, Number.parseInt(first(params.page) ?? "1", 10) || 1);

  await connectDB();
  const rx = new RegExp(escapeRegex(q), "i");
  const filter = q ? { $or: [{ name: rx }, { slug: rx }] } : {};

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ _id: -1 }) // newest first
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<ProductLean[]>(),
    Product.countDocuments(filter),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `/admin/products?${query}` : "/admin/products";
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex h-[40px] items-center gap-[8px] rounded-[4px] bg-black px-[16px] text-[14px] font-semibold text-white transition-colors hover:bg-[#1F1F1F]"
        >
          <Plus strokeWidth={2} className="size-[16px]" />
          Add product
        </Link>
      </div>

      <form action="/admin/products" className="mt-[16px] flex max-w-[420px] gap-[8px]">
        <div className="relative flex-1">
          <Search strokeWidth={1.75} className="pointer-events-none absolute left-[12px] top-1/2 size-[16px] -translate-y-1/2 text-[#6B6B6B]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name"
            className="h-[40px] w-full rounded-[4px] border border-[#E5E5E5] bg-white pl-[36px] pr-[12px] text-[14px] text-black outline-none focus:border-black"
          />
        </div>
        <button type="submit" className="h-[40px] rounded-[4px] bg-white px-[14px] text-[14px] text-black ring-1 ring-[#E5E5E5] transition-colors hover:bg-[#EBEBEB]">
          Search
        </button>
      </form>

      <div className="mt-[16px] overflow-x-auto rounded-[4px] border border-[#E5E5E5] bg-white">
        {products.length === 0 ? (
          <p className="p-[20px] text-[14px] text-[#6B6B6B]">No products found.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[12px] uppercase text-[#6B6B6B]">
                <th className="px-[16px] py-[12px] font-semibold">Product</th>
                <th className="px-[16px] py-[12px] font-semibold">Category</th>
                <th className="px-[16px] py-[12px] font-semibold">Price</th>
                <th className="px-[16px] py-[12px] font-semibold">Stock</th>
                <th className="px-[16px] py-[12px] text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug} className="border-b border-[#F2F2F2] last:border-b-0 hover:bg-[#FAFAFA]">
                  <td className="px-[16px] py-[10px]">
                    <div className="flex items-center gap-[12px]">
                      <div className="relative size-[48px] shrink-0 overflow-hidden rounded-[4px] bg-[#F2F2F2]">
                        {product.images[0] && (
                          <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/products/${product.slug}`} className="block truncate font-semibold text-black hover:underline">
                          {product.name}
                        </Link>
                        <p className="truncate text-[12px] text-[#6B6B6B]">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-[16px] py-[10px] capitalize text-[#6B6B6B]">
                    {product.category}
                    {product.subcategory ? ` / ${product.subcategory}` : ""}
                  </td>
                  <td className="px-[16px] py-[10px] font-semibold text-black">${product.price.toFixed(2)}</td>
                  <td className="px-[16px] py-[10px]">
                    {product.stock === 0 ? (
                      <span className="bg-[#FDECEC] px-[8px] py-[4px] text-[11px] font-bold uppercase text-[#C62828]">Out of stock</span>
                    ) : (
                      <span className="text-black">{product.stock}</span>
                    )}
                  </td>
                  <td className="px-[16px] py-[10px]">
                    <div className="flex items-center justify-end gap-[4px]">
                      <Link
                        href={`/admin/products/${product.slug}`}
                        className="flex h-[32px] items-center rounded-[4px] px-[10px] text-[13px] text-black transition-colors hover:bg-[#F2F2F2]"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton slug={product.slug} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-[16px] flex items-center justify-between text-[13px] text-[#6B6B6B]">
          <p>
            Page {page} of {pages} · {total} products
          </p>
          <div className="flex gap-[8px]">
            {page > 1 && (
              <Link href={pageHref(page - 1)} className="flex h-[36px] items-center rounded-[4px] bg-white px-[14px] text-black ring-1 ring-[#E5E5E5] hover:bg-[#EBEBEB]">
                Previous
              </Link>
            )}
            {page < pages && (
              <Link href={pageHref(page + 1)} className="flex h-[36px] items-center rounded-[4px] bg-white px-[14px] text-black ring-1 ring-[#E5E5E5] hover:bg-[#EBEBEB]">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse bg-[#F2F2F2]" />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}