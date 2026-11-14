import { Suspense } from "react";
import { MenuVisibilityEditor } from "@/components/admin/menu-visibility-editor";
import { requireAdmin } from "@/lib/admin";
import { readHiddenPaths } from "@/lib/menu-visibility";

async function CategoriesContent() {
  await requireAdmin(); // every admin page checks again; never rely on the layout alone
  const hiddenPaths = await readHiddenPaths();

  return (
    <>
      <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">Categories</h1>
      <p className="mt-[8px] max-w-[640px] text-[14px] leading-[20px] text-[#6B6B6B]">
        Hide a menu, category or subcategory from the store. Hidden items disappear from the menus and their
        pages say they are not available. Nothing is deleted, so you can show them again at any time.
      </p>
      <MenuVisibilityEditor initialHidden={hiddenPaths} />
    </>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse bg-[#F2F2F2]" />}>
      <CategoriesContent />
    </Suspense>
  );
}