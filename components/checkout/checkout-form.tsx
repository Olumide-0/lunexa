"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SHIPPING_FEE_USD, shippingSchema, type ShippingInput } from "@/lib/checkout";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { selectCartSubtotal, useCartStore } from "@/store/cart-store";

type FieldName = keyof ShippingInput;
type Errors = Partial<Record<FieldName, string>>;

const emptyForm: Record<FieldName, string> = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
};

/* ---------- One labelled input ---------- */
function Field({
  label,
  name,
  value,
  error,
  onChange,
  autoComplete,
  type = "text",
  optional = false,
}: {
  label: string;
  name: FieldName;
  value: string;
  error?: string;
  onChange: (name: FieldName, value: string) => void;
  autoComplete?: string;
  type?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[13px] font-semibold leading-[18px] text-black">
        {label}
        {optional && <span className="font-normal text-[#6B6B6B]"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(name, e.target.value)}
        className={`mt-[6px] h-[48px] w-full rounded-[2px] border bg-white px-[14px] text-[14px] text-black outline-none transition-colors focus:border-black ${
          error ? "border-[#C0392B]" : "border-[#D5D5D5]"
        }`}
      />
      {error && (
        <p role="alert" className="mt-[4px] text-[12px] leading-[16px] text-[#C0392B]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutForm() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const [ready, setReady] = useState(false); // saved bag + login are loaded from the browser
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // The bag and login are saved in the browser and loaded after the page mounts,
  // so wait for both before deciding what to show.
  useEffect(() => {
    function check() {
      if (useCartStore.persist.hasHydrated() && useAuthStore.persist.hasHydrated()) setReady(true);
    }
    check();
    const stopCart = useCartStore.persist.onFinishHydration(check);
    const stopAuth = useAuthStore.persist.onFinishHydration(check);
    return () => {
      stopCart();
      stopAuth();
    };
  }, []);

  function handleChange(name: FieldName, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    // Check the address in the browser first (the server checks it again)
    const parsed = shippingSchema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    let leavingForPayment = false;
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          // Only ids, sizes and quantities. The server looks the prices up itself.
          items: items.map((item) => ({ productId: item.productId, size: item.size, quantity: item.quantity })),
        }),
      });
      const data = await response.json();

      if (response.status === 401) {
        openAuthModal("login");
        return;
      }
      if (!response.ok) {
        if (data.errors) setErrors(Object.fromEntries(Object.entries(data.errors).map(([k, v]) => [k, (v as string[])[0]])));
        setMessage(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      // Send the customer to Paystack to pay. The bag is emptied after the payment succeeds.
      leavingForPayment = true; // keep the button on "Placing order..." while the browser leaves
      window.location.assign(data.authorizationUrl);
    } catch {
      setMessage("Could not reach the server. Check your connection and try again.");
    } finally {
      if (!leavingForPayment) setSubmitting(false);
    }
  }

  /* ---------- Not ready / empty / signed out ---------- */
  if (!ready) {
    return <div className="container mx-auto h-[400px] w-11/12 animate-pulse bg-[#F2F2F2]" />;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto w-11/12 py-[80px] text-center">
        <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">Your bag is empty</h1>
        <p className="mt-[10px] text-[14px] text-[#6B6B6B]">Add something to your bag before checking out.</p>
        <div className="mt-[24px] flex justify-center gap-[12px]">
          <Link href="/women" className="flex h-[48px] items-center rounded-full bg-black px-[28px] text-[15px] font-semibold text-white">
            Shop Womens
          </Link>
          <Link href="/men" className="flex h-[48px] items-center rounded-full bg-black px-[28px] text-[15px] font-semibold text-white">
            Shop Mens
          </Link>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto w-11/12 py-[80px] text-center">
        <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">Sign in to check out</h1>
        <p className="mt-[10px] text-[14px] text-[#6B6B6B]">Your bag is saved. Sign in or create an account to place your order.</p>
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="mt-[24px] h-[48px] rounded-full bg-black px-[32px] text-[15px] font-semibold text-white transition-colors hover:bg-[#333333]"
        >
          Sign in
        </button>
      </div>
    );
  }

  const total = subtotal + SHIPPING_FEE_USD;

  return (
    <div className="container mx-auto w-11/12 pb-[80px] pt-[32px]">
      <h1 className="text-[28px] font-bold uppercase leading-[34px] text-black">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-[28px] grid gap-[40px] lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-[64px]">
        {/* ---------- Left: delivery + payment ---------- */}
        <div>
          <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">Delivery address</h2>
          <div className="mt-[16px] grid gap-[16px] sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full name" name="fullName" value={form.fullName} error={errors.fullName} onChange={handleChange} autoComplete="name" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Phone number" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={handleChange} autoComplete="tel" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Street address" name="address" value={form.address} error={errors.address} onChange={handleChange} autoComplete="street-address" />
            </div>
            <Field label="City" name="city" value={form.city} error={errors.city} onChange={handleChange} autoComplete="address-level2" />
            <Field label="State" name="state" value={form.state} error={errors.state} onChange={handleChange} autoComplete="address-level1" />
            <Field label="Postal code" name="postalCode" value={form.postalCode} error={errors.postalCode} onChange={handleChange} autoComplete="postal-code" optional />
            <div>
              <p className="text-[13px] font-semibold leading-[18px] text-black">Country</p>
              <p className="mt-[6px] flex h-[48px] items-center rounded-[2px] border border-[#E5E5E5] bg-[#F7F7F7] px-[14px] text-[14px] text-[#6B6B6B]">
                Nigeria
              </p>
            </div>
          </div>

          <h2 className="mt-[40px] text-[16px] font-bold uppercase leading-[22px] text-black">Payment</h2>
          <p className="mt-[12px] rounded-[2px] border border-[#E5E5E5] bg-[#F7F7F7] px-[16px] py-[14px] text-[14px] leading-[20px] text-[#3A3A3A]">
            You will pay securely on Paystack after placing your order. Test mode: use a Paystack test card, no real money is charged.
          </p>
        </div>

        {/* ---------- Right: order summary ---------- */}
        <aside className="h-fit rounded-[4px] bg-[#F7F7F7] p-[24px]">
          <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">Order summary</h2>
          <ul className="mt-[16px] divide-y divide-[#E5E5E5]">
            {items.map((item) => (
              <li key={item.key} className="flex gap-[14px] py-[14px]">
                <div className="relative h-[84px] w-[66px] shrink-0 overflow-hidden rounded-[2px] bg-[#E8E4DF]">
                  <Image src={item.image} alt={item.name} fill sizes="66px" className="object-cover" />
                </div>
                <div className="flex flex-1 justify-between gap-[10px]">
                  <div>
                    <p className="text-[14px] font-semibold leading-[20px] text-black">{item.name}</p>
                    {item.subtitle && <p className="text-[12px] leading-[16px] text-[#6B6B6B]">{item.subtitle}</p>}
                    <p className="mt-[2px] text-[12px] leading-[16px] text-[#6B6B6B]">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-[14px] font-semibold leading-[20px] text-black">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-[8px] space-y-[8px] border-t border-[#E5E5E5] pt-[16px] text-[14px] leading-[20px] text-black">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{SHIPPING_FEE_USD === 0 ? "Free" : formatPrice(SHIPPING_FEE_USD)}</dd>
            </div>
            <div className="flex justify-between text-[16px] font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          {message && (
            <p role="alert" className="mt-[16px] text-[13px] leading-[18px] text-[#C0392B]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-[20px] flex h-[52px] w-full items-center justify-center gap-[10px] rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:cursor-not-allowed disabled:bg-[#9A9A9A]"
          >
            {submitting && <Loader2 strokeWidth={1.75} className="size-[18px] animate-spin" />}
            {submitting ? "Placing order..." : "Place order and pay"}
          </button>
        </aside>
      </form>
    </div>
  );
}