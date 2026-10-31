"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number; // current page, starting at 1
  totalPages: number;
  onChange: (page: number) => void;
};

type Slot = { type: "page"; value: number } | { type: "gap"; key: string };

// Which numbers to show: first, last, the current page and the ones next to it.
// Example (page 5 of 12): 1 … 4 5 6 … 12
function getSlots(page: number, totalPages: number): Slot[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = Array.from(wanted)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const slots: Slot[] = [];
  pages.forEach((value, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && value - previous > 1) {
      // One missing number: just show it. More than one: show "…"
      if (value - previous === 2) slots.push({ type: "page", value: previous + 1 });
      else slots.push({ type: "gap", key: `gap-${previous}` });
    }
    slots.push({ type: "page", value });
  });
  return slots;
}

const baseButton =
  "flex size-[40px] items-center justify-center rounded-full text-[14px] transition-colors";

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const slots = getSlots(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-[4px] sm:gap-[8px]">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={`${baseButton} border border-[#D4D4D4] text-black hover:border-black disabled:cursor-default disabled:opacity-30 disabled:hover:border-[#D4D4D4]`}
      >
        <ChevronLeft strokeWidth={1.75} className="size-[18px]" />
      </button>

      {slots.map((slot) => {
        if (slot.type === "gap") {
          return (
            <span key={slot.key} aria-hidden="true" className="flex size-[28px] items-end justify-center pb-[10px] text-[14px] text-[#6B6B6B] sm:size-[40px]">
              …
            </span>
          );
        }

        const active = slot.value === page;
        // On small phones, hide the numbers next to the current page to save space
        // (first, last and current always stay)
        const alwaysShown = active || slot.value === 1 || slot.value === totalPages;

        return (
          <button
            key={slot.value}
            type="button"
            aria-label={`Page ${slot.value}`}
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(slot.value)}
            className={`${baseButton} ${alwaysShown ? "" : "max-[420px]:hidden"} ${
              active ? "bg-black font-semibold text-white" : "text-black hover:bg-[#EBEBEB]"
            }`}
          >
            {slot.value}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className={`${baseButton} border border-[#D4D4D4] text-black hover:border-black disabled:cursor-default disabled:opacity-30 disabled:hover:border-[#D4D4D4]`}
      >
        <ChevronRight strokeWidth={1.75} className="size-[18px]" />
      </button>
    </nav>
  );
}