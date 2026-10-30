import { cacheLife } from "next/cache";

// Runs on the server only. Asks ExchangeRate-API for today's rates using your
// private key, and keeps the answer for a few hours so all shoppers share one call.
async function getUsdRates() {
  "use cache";
  cacheLife("hours"); // reuse the saved answer for a few hours before asking again

  const key = process.env.EXCHANGE_RATE_API_KEY;
  if (!key) throw new Error("EXCHANGE_RATE_API_KEY is missing from .env.local");

  const response = await fetch(`https://v6.exchangerate-api.com/v6/${key}/latest/USD`);
  if (!response.ok) throw new Error(`Rates request failed: ${response.status}`);

  const data = await response.json();
  if (data.result !== "success") throw new Error(data["error-type"] ?? "Rates API error");

  // Only send the browser the 3 currencies we use (1 USD = …)
  return {
    USD: 1,
    NGN: data.conversion_rates.NGN,
    GBP: data.conversion_rates.GBP,
  };
}

// GET /api/rates
export async function GET() {
  try {
    const rates = await getUsdRates();
    return Response.json({ result: "success", rates });
  } catch (error) {
    console.error("Exchange rates error:", error); // shows in your terminal, not the browser
    return Response.json({ result: "error" }, { status: 502 });
  }
}