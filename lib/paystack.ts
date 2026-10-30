// Small helpers for the Paystack API. These only run on the server (the secret key must never reach the browser).
const BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is missing from .env.local");

  // Safety net: while developing, only TEST keys are allowed, so real money can never move by accident
  if (process.env.NODE_ENV !== "production" && !key.startsWith("sk_test_")) {
    throw new Error("Use your Paystack TEST secret key (sk_test_...) while developing");
  }
  return key;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store", // never reuse an old answer
  });
  const json: { status: boolean; message: string; data: T } = await response.json();
  if (!response.ok || !json.status) throw new Error(`Paystack error: ${json.message}`);
  return json.data;
}

// Starts a payment. Paystack gives back a page the customer is sent to, to pay.
export function initializeTransaction(params: {
  email: string;
  amountNgn: number; // whole naira (we convert to kobo here)
  reference: string;
  callbackUrl: string; // where Paystack sends the customer afterwards
}) {
  return paystackRequest<{ authorization_url: string; access_code: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        amount: params.amountNgn * 100, // Paystack counts in kobo (100 kobo = ₦1)
        currency: "NGN",
        reference: params.reference,
        callback_url: params.callbackUrl,
      }),
    }
  );
}

// Asks Paystack what really happened to a payment. We never trust the browser for this.
export function verifyTransaction(reference: string) {
  return paystackRequest<{ status: string; amount: number; currency: string; reference: string }>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}