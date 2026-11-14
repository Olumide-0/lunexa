"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export type RangeOption = { value: string; label: string };

// Changing the dropdown puts ?range=... in the address bar, and the dashboard page reads it on the server
export function RangeSelect({ value, options }: { value: string; options: RangeOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative">
      <select
        value={value}
        disabled={pending}
        aria-label="Time range"
        onChange={(event) => {
          const next = event.target.value;
          startTransition(() => router.push(`/admin?range=${next}`, { scroll: false }));
        }}
        className="h-[36px] cursor-pointer appearance-none rounded-[4px] border border-[#E5E5E5] bg-white pl-[12px] pr-[32px] text-[14px] text-black outline-none focus:border-black disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[10px] top-1/2 size-[16px] -translate-y-1/2 text-[#6B6B6B]" />
    </div>
  );
}