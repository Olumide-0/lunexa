import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "USD" | "NGN" | "GBP";

// How each currency is displayed. All product prices in the data are in USD.
export const currencies: Record<CurrencyCode, { locale: string; decimals: number }> = {
  USD: { locale: "en-US", decimals: 2 },
  NGN: { locale: "en-NG", decimals: 0 }, // naira prices are shown as whole numbers
  GBP: { locale: "en-GB", decimals: 2 },
};

// Backup rates (1 USD = …), only used until the live rates load or if the API is down
const fallbackRates: Record<CurrencyCode, number> = { USD: 1, NGN: 1350, GBP: 0.78 };

// Free exchange-rate API (no key needed). Returns every currency against USD, updated daily.
// Our own API route (app/api/rates/route.ts). It calls ExchangeRate-API with the secret key.
const RATES_URL = "/api/rates";
const REFRESH_AFTER = 12 * 60 * 60 * 1000; // fetch again after 12 hours

type CurrencyState = {
  country: string; // flag code, e.g. "us", "ng", "gb"
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>; // 1 USD = rates[code]
  ratesUpdatedAt: number | null; // when we last fetched (milliseconds), null = never
  setCountry: (country: string, currency: CurrencyCode) => void; // country picks its own currency
  setCurrency: (currency: CurrencyCode) => void; // currency dropdown on its own
  loadRates: () => Promise<void>; // fetch live rates if ours are old
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      country: "us",
      currency: "USD",
      rates: fallbackRates,
      ratesUpdatedAt: null,
      setCountry: (country, currency) => set({ country, currency }),
      setCurrency: (currency) => set({ currency }),

      loadRates: async () => {
        const { ratesUpdatedAt } = get();
        // Saved rates are still fresh: no need to call the API again
        if (ratesUpdatedAt && Date.now() - ratesUpdatedAt < REFRESH_AFTER) return;

        try {
          const response = await fetch(RATES_URL);
          if (!response.ok) throw new Error(`Rates request failed: ${response.status}`);
          const data: { result: string; rates: Record<string, number> } = await response.json();
          if (data.result !== "success") throw new Error("Rates API returned an error");

          set({
            rates: {
              USD: 1,
              NGN: data.rates.NGN ?? fallbackRates.NGN,
              GBP: data.rates.GBP ?? fallbackRates.GBP,
            },
            ratesUpdatedAt: Date.now(),
          });
        } catch (error) {
          // Keep the last saved (or backup) rates so prices still show
          console.error("Could not load exchange rates:", error);
        }
      },
    }),
    {
      name: "lunexa-currency", // key in localStorage
      skipHydration: true, // loaded in the announcement bar after the page mounts
      // Save these (not the functions) so the rates survive a refresh
      partialize: (state) => ({
        country: state.country,
        currency: state.currency,
        rates: state.rates,
        ratesUpdatedAt: state.ratesUpdatedAt,
      }),
    }
  )
);