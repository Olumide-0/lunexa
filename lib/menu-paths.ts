// Works in the browser and on the server (no database code here).
import { navMenus } from "@/data/navigation";
import { slugify } from "@/lib/utils";

// A link is hidden if it, or anything above it, is hidden.
// Hiding "/women" also hides "/women/leggings".
export function isPathHidden(path: string, hiddenPaths: string[]): boolean {
  return hiddenPaths.some((hidden) => path === hidden || path.startsWith(`${hidden}/`));
}

export type MenuTreeItem = { label: string; path: string };
export type MenuTreeCategory = MenuTreeItem & { subcategories: MenuTreeItem[] };
export type MenuTreeGroup = { label: string | null; categories: MenuTreeCategory[] }; // label = "Women" / "Men" for Accessories
export type MenuTreeMenu = MenuTreeItem & { groups: MenuTreeGroup[] };

// Every menu, category and subcategory with the same links the mega menu uses
export function buildMenuTree(): MenuTreeMenu[] {
  return navMenus.map((menu) => {
    const groups: { label: string | null; base: string; categories: typeof menu.categories }[] = menu.audiences
      ? (["women", "men"] as const).map((audience) => ({
          label: audience === "women" ? "Women" : "Men",
          base: `${menu.href}/${audience}`,
          categories: menu.audiences![audience],
        }))
      : [{ label: null, base: menu.href, categories: menu.categories ?? [] }];

    return {
      label: menu.label,
      path: menu.href,
      groups: groups.map(({ label, base, categories }) => ({
        label,
        categories: (categories ?? []).map((category) => ({
          label: category.title,
          path: `${base}/${slugify(category.title)}`,
          subcategories: category.subcategories.map((sub) => ({ label: sub, path: `${base}/${slugify(sub)}` })),
        })),
      })),
    };
  });
}

// All links the admin is allowed to hide
export function allMenuPaths(): Set<string> {
  const paths = new Set<string>();
  for (const menu of buildMenuTree()) {
    paths.add(menu.path);
    for (const group of menu.groups) {
      for (const category of group.categories) {
        paths.add(category.path);
        for (const sub of category.subcategories) paths.add(sub.path);
      }
    }
  }
  return paths;
}