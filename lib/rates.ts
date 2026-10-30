import { cacheLife } from "next/cache";

// Same free exchange-rate API the site's currency picker uses (no key needed)
const RATES_URL = "https://open.er-api.com/v6/latest/USD";
const FALLBACK_NGN = 1350; // only used if the API is down, same backup as the currency store

// 1 USD = ? naira. Remembered for a few hours so we don't call the API on every checkout.
export async function getNgnRate(): Promise<number> {
  "use cache";
  cacheLife("hours");

  try {
    const response = await fetch(RATES_URL);
    if (!response.ok) throw new Error(`Rates request failed: ${response.status}`);
    const data: { result: string; rates: Record<string, number> } = await response.json();
    if (data.result !== "success" || !data.rates.NGN) throw new Error("Rates API returned an error");
    return data.rates.NGN;
  } catch (error) {
    console.error("Could not load the naira rate, using the backup:", error);
    return FALLBACK_NGN;
  }
}