"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme/theme-provider";

const options: { value: Theme; label: string; Icon: LucideIcon }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

// variant "icon":   a small button in the navbar that opens a Light / Dark / System menu
// variant "inline": the three choices side by side (used inside the mobile menu)
export default function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "inline" }) {
  const { theme, resolvedTheme, setTheme, ready } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close the menu on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (variant === "inline") {
    return (
      <div role="radiogroup" aria-label="Colour theme" className="flex gap-[8px]">
        {options.map(({ value, label, Icon }) => {
          const active = ready && theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={`flex h-[44px] flex-1 items-center justify-center gap-[8px] rounded-full border text-[14px] transition-colors ${
                active
                  ? "border-black bg-black font-semibold text-white"
                  : "border-[#D4D4D4] text-black hover:border-black"
              }`}
            >
              <Icon strokeWidth={1.5} className="size-[16px]" />
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  // Before the saved choice is read, show a same-size empty space so nothing jumps
  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Colour theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-[20px] items-center justify-center"
      >
        {ready && <CurrentIcon strokeWidth={1.5} className="size-[20px] text-black" />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+12px)] z-50 w-[160px] rounded-[4px] bg-white py-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {options.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === value}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className="flex w-full items-center gap-[10px] px-[16px] py-[10px] text-left text-[14px] text-black hover:bg-[#F2F2F2]"
            >
              <Icon strokeWidth={1.5} className="size-[16px]" />
              <span className="flex-1">{label}</span>
              {theme === value && <Check strokeWidth={2} className="size-[16px]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}