"use client";

import { useMemo, useState } from "react";
import { buildMenuTree, isPathHidden } from "@/lib/menu-paths";

function Switch({
  label,
  shown,
  disabled,
  busy,
  onToggle,
}: {
  label: string;
  shown: boolean;
  disabled?: boolean;
  busy?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={shown}
      aria-label={`${shown ? "Hide" : "Show"} ${label}`}
      disabled={disabled || busy}
      onClick={onToggle}
      className="flex shrink-0 items-center gap-[8px] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="w-[48px] text-right text-[12px] leading-[16px] text-[#6B6B6B]">{shown ? "Shown" : "Hidden"}</span>
      <span
        className={`relative h-[20px] w-[36px] rounded-full transition-colors ${shown ? "bg-black" : "bg-[#D4D4D4]"} ${
          busy ? "animate-pulse" : ""
        }`}
      >
        <span
          className={`absolute top-[2px] size-[16px] rounded-full bg-white transition-[left] ${shown ? "left-[18px]" : "left-[2px]"}`}
        />
      </span>
    </button>
  );
}

export function MenuVisibilityEditor({ initialHidden }: { initialHidden: string[] }) {
  const tree = useMemo(() => buildMenuTree(), []);
  const [hidden, setHidden] = useState<string[]>(initialHidden);
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(path: string) {
    const hide = !hidden.includes(path);
    const previous = hidden;
    setError(null);
    setBusyPath(path);
    setHidden(hide ? [...hidden, path] : hidden.filter((item) => item !== path)); // show the change straight away

    try {
      const response = await fetch("/api/admin/menu-visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, hidden: hide }),
      });
      const data: { hiddenPaths?: string[]; message?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !data.hiddenPaths) throw new Error(data.message ?? "Could not save. Please try again.");
      setHidden(data.hiddenPaths);
    } catch (err) {
      setHidden(previous); // put it back the way it was
      setError(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setBusyPath(null);
    }
  }

  // A row is "shown" only if it and everything above it is shown
  const ownShown = (path: string) => !hidden.includes(path);
  const parentHidden = (path: string) =>
    isPathHidden(path, hidden.filter((item) => item !== path)); // hidden because a parent is hidden

  return (
    <div className="mt-[24px] grid gap-[16px]">
      {error && <p className="rounded-[4px] bg-[#FDECEC] px-[16px] py-[12px] text-[14px] text-[#C62828]">{error}</p>}

      {tree.map((menu) => {
        const menuShown = ownShown(menu.path);
        return (
          <section key={menu.path} className="rounded-[4px] border border-[#E5E5E5] bg-white">
            <div className="flex items-center justify-between gap-[12px] border-b border-[#E5E5E5] px-[20px] py-[16px]">
              <div>
                <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">{menu.label}</h2>
                <p className="text-[12px] leading-[16px] text-[#6B6B6B]">
                  {menuShown ? menu.path : "Hidden: this whole menu and its pages are hidden"}
                </p>
              </div>
              <Switch label={menu.label} shown={menuShown} busy={busyPath === menu.path} onToggle={() => toggle(menu.path)} />
            </div>

            <div className={`grid gap-[20px] px-[20px] py-[16px] ${menuShown ? "" : "opacity-50"}`}>
              {menu.groups.map((group) => (
                <div key={group.label ?? "all"}>
                  {group.label && (
                    <p className="mb-[8px] text-[12px] font-semibold uppercase leading-[16px] text-[#6B6B6B]">{group.label}</p>
                  )}
                  <ul className="grid gap-[12px] md:grid-cols-2">
                    {group.categories.map((category) => {
                      const categoryShown = ownShown(category.path);
                      const blocked = parentHidden(category.path);
                      return (
                        <li key={category.path} className="rounded-[4px] border border-[#F2F2F2] p-[12px]">
                          <div className="flex items-center justify-between gap-[12px]">
                            <span className="text-[14px] font-semibold text-black">{category.label}</span>
                            <Switch
                              label={category.label}
                              shown={categoryShown}
                              disabled={blocked}
                              busy={busyPath === category.path}
                              onToggle={() => toggle(category.path)}
                            />
                          </div>
                          <ul
                            className={`mt-[8px] grid gap-[6px] border-t border-[#F2F2F2] pt-[8px] ${
                              categoryShown && !blocked ? "" : "opacity-50"
                            }`}
                          >
                            {category.subcategories.map((sub) => (
                              <li key={sub.path} className="flex items-center justify-between gap-[12px] pl-[12px]">
                                <span className="truncate text-[13px] text-black">{sub.label}</span>
                                <Switch
                                  label={sub.label}
                                  shown={ownShown(sub.path)}
                                  disabled={!categoryShown || blocked || parentHidden(sub.path)}
                                  busy={busyPath === sub.path}
                                  onToggle={() => toggle(sub.path)}
                                />
                              </li>
                            ))}
                          </ul>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <p className="text-[12px] leading-[18px] text-[#6B6B6B]">
        Hiding a category also hides its list of subcategories in the menu. Some names appear more than once (for
        example &quot;Leggings&quot;) because they open the same page, so their switches move together.
      </p>
    </div>
  );
}