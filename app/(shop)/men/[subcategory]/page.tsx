import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import CategoryHero from "@/components/category/category-hero";
import CategoryListing from "@/components/category/category-listing";
import { shopColumns } from "@/data/footer";
import { navMenus } from "@/data/navigation";
import { slugify } from "@/lib/utils";

type PageInfo = {
  title: string; // big heading, e.g. "Running Shorts"
  group: string; // bold word in the sidebar, e.g. "Shorts"
};

// Builds every Men page from the mega menu data (each category and subcategory)
// and from the Men footer links. Adding a name in data/navigation.ts or
// data/footer.ts creates its page automatically.
function getMenPages(): Record<string, PageInfo> {
  const men = navMenus.find((menu) => menu.label === "Men");
  const pages: Record<string, PageInfo> = {};

  for (const category of men?.categories ?? []) {
    const categorySlug = slugify(category.title);
    if (!pages[categorySlug]) {
      pages[categorySlug] = { title: category.title, group: category.title };
    }
    for (const sub of category.subcategories) {
      const slug = slugify(sub);
      // The same name can appear twice (e.g. "Shorts" is a category and a product type); keep the first one
      if (!pages[slug]) pages[slug] = { title: sub, group: category.title };
    }
  }

  // Footer links under /men (e.g. "Gym Stringers") that aren't in the mega menu
  for (const column of shopColumns) {
    if (column.basePath !== "/men") continue;
    for (const link of column.links) {
      const slug = slugify(link);
      if (!pages[slug]) pages[slug] = { title: link, group: column.group ?? "Men" };
    }
  }

  return pages;
}

// Pre-builds every Men page. Any other slug (e.g. /men/abc) hits notFound() below.
export function generateStaticParams() {
  return Object.keys(getMenPages()).map((subcategory) => ({ subcategory }));
}

type Props = { params: Promise<{ subcategory: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subcategory } = await params;
  const page = getMenPages()[subcategory];
  if (!page) return {};
  return {
    title: `${page.title} | Lunexa`,
    description: `Shop men's ${page.title.toLowerCase()} at Lunexa.`,
  };
}

// The part that reads the URL. It sits inside <Suspense> (below) so Next.js
// can show the page shell instantly while it works out which subcategory this is.
async function SubcategoryContent({ params }: Props) {
  const { subcategory } = await params;
  const page = getMenPages()[subcategory];
  if (!page) notFound();

  return (
    <>
      <CategoryHero title={page.title} audience="Men" />
      <CategoryListing group={page.group} audience="Men" />
    </>
  );
}

// Shown for a split second while SubcategoryContent loads.
// Same height as the hero so the page doesn't jump.
function SubcategoryFallback() {
  return <div className="h-[280px] w-full animate-pulse bg-[#E8E4DF] sm:h-[420px] lg:h-[600px]" />;
}

export default function MenSubcategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<SubcategoryFallback />}>
      <SubcategoryContent params={params} />
    </Suspense>
  );
}