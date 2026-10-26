"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Option = {
  value: string;
  label: string;
  flag?: string; // country code for flagcdn, e.g. "us"
};

const countries: (Option & { currency: string })[] = [
  { value: "us", label: "United States", flag: "us", currency: "USD" },
  { value: "ng", label: "Nigeria", flag: "ng", currency: "NGN" },
  { value: "gb", label: "United Kingdom", flag: "gb", currency: "GBP" },
];

const currencies: Option[] = [
  { value: "USD", label: "USD" },
  { value: "NGN", label: "NGN" },
  { value: "GBP", label: "GBP" },
];

function Flag({ code }: { code: string }) {
  return (
    <Image
      src={`https://flagcdn.com/w40/${code}.png`}
      alt=""
      width={26}
      height={18}
      className="h-[18px] w-[26px] object-cover"
    />
  );
}

function SelectMenu({
  options,
  value,
  onChange,
  widthClass,
  label,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  widthClass: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-[40px] items-center gap-[10px] bg-[#E5E5E5] px-[12px] text-[14px] text-black sm:text-[16px] ${widthClass}`}
      >
        {selected.flag && <Flag code={selected.flag} />}
        <span className="flex-1 text-left">{selected.label}</span>
        <ChevronDown
          strokeWidth={1.5}
          className={`size-[18px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute left-0 top-full z-50 mt-[4px] w-full bg-white py-[4px] shadow-lg">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-[10px] px-[12px] py-[8px] text-left text-[14px] text-black hover:bg-[#F2F2F2] ${
                  option.value === value ? "font-semibold" : ""
                }`}
              >
                {option.flag && <Flag code={option.flag} />}
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AnnouncementBar() {
  const [country, setCountry] = useState("us");
  const [currency, setCurrency] = useState("USD");

  function handleCountryChange(value: string) {
    setCountry(value);
    // Picking a country also switches to its currency
    const match = countries.find((c) => c.value === value);
    if (match) setCurrency(match.currency);
  }

  return (
    <div className="bg-black">
      <div className="w-11/12 container mx-auto flex min-h-[68px] items-center justify-center gap-[16px] px-[16px] py-[14px]">
        <p className="hidden text-[16px] font-bold uppercase text-white sm:block">
          Are you in the right place?
        </p>
        <div className="flex items-center gap-[8px]">
          <SelectMenu
            label="Select country"
            options={countries}
            value={country}
            onChange={handleCountryChange}
            widthClass="w-[180px] sm:w-[198px]"
          />
          <SelectMenu
            label="Select currency"
            options={currencies}
            value={currency}
            onChange={setCurrency}
            widthClass="w-[86px]"
          />
        </div>
      </div>
    </div>
  );
}