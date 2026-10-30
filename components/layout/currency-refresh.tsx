"use client";

import { Fragment } from "react";
import { useCurrencyStore } from "@/store/currency-store";

// When the currency (or its live rate) changes, the `key` changes, so React
// redraws everything inside. That makes every formatPrice() on the page run
// again, without editing each component that shows a price.
export default function CurrencyRefresh({ children }: { children: React.ReactNode }) {
  const currency = useCurrencyStore((state) => state.currency);
  const rate = useCurrencyStore((state) => state.rates[state.currency]);
  return <Fragment key={`${currency}-${rate}`}>{children}</Fragment>;
}