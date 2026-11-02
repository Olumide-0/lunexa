"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Ban, ClipboardCheck, Clock, CreditCard, Loader2, PackageCheck, Truck, type LucideIcon } from "lucide-react";

type TrackedOrder = {
  orderNumber: string;
  status: "pending" | "paid" | "failed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  city: string;
  state: string;
  amountNgn: number;
  items: { slug: string; name: string; subtitle: string | null; image: string; size: string; quantity: number }[];
};

const naira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

// How far along a normal order is (index into `steps` below)
const progress: Record<string, number> = { paid: 1, shipped: 2, delivered: 3 };

export default function TrackOrder() {
  const searchParams = useSearchParams();
  const orderFromUrl = searchParams.get("order") ?? "";

  const [orderNumber, setOrderNumber] = useState(orderFromUrl);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(value: string) {
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: value }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setOrder(json);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // A link like /track-order?order=LX-C4BD413A looks the order up straight away
  useEffect(() => {
    if (orderFromUrl) lookup(orderFromUrl);
  }, [orderFromUrl]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError("Enter your order number, like LX-1A2B3C4D.");
      setOrder(null);
      return;
    }
    lookup(orderNumber);
  }

  return (
    <div className="container mx-auto w-11/12 pb-[80px] pt-[40px]">
      <div className="mx-auto max-w-[560px] text-center">
        <h1 className="text-[28px] font-bold uppercase leading-[34px] text-black">Track your order</h1>
        <p className="mt-[8px] text-[14px] leading-[20px] text-[#6B6B6B]">
          Enter your order number to see where your order is. You can find it in your confirmation page and in My
          orders.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-[24px] flex flex-col gap-[12px] sm:flex-row">
          <label htmlFor="order-number" className="sr-only">
            Order number
          </label>
          <input
            id="order-number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order number, e.g. LX-1A2B3C4D"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!error}
            className="h-[48px] w-full rounded-[4px] border border-[#CFCFCF] bg-white px-[14px] text-[15px] text-black outline-none transition-colors placeholder:text-[#737373] focus:border-black"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-[48px] shrink-0 items-center justify-center gap-[8px] rounded-full bg-black px-[32px] text-[15px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:bg-[#9A9A9A]"
          >
            {loading && <Loader2 strokeWidth={2} className="size-[18px] animate-spin" />}
            Track order
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-[12px] text-left text-[13px] leading-[18px] text-[#D92D20]">
            {error}
          </p>
        )}
      </div>

      {order && <OrderResult order={order} />}
    </div>
  );
}

function OrderResult({ order }: { order: TrackedOrder }) {
  const steps: { title: string; text: string; icon: LucideIcon; date: string | null }[] = [
    {
      title: "Order placed",
      text: "We've received your order.",
      icon: ClipboardCheck,
      date: formatDate(order.createdAt),
    },
    {
      title: "Payment confirmed",
      text: "Your payment went through and we're getting your order ready.",
      icon: CreditCard,
      date: order.paidAt ? formatDate(order.paidAt) : null,
    },
    {
      title: "Shipped",
      text: "Your order is on its way to you.",
      icon: Truck,
      date: order.status === "shipped" ? formatDate(order.updatedAt) : null,
    },
    {
      title: "Delivered",
      text: "Your order has been delivered.",
      icon: PackageCheck,
      date: order.status === "delivered" ? formatDate(order.updatedAt) : null,
    },
  ];

  const current = progress[order.status]; // undefined when pending, failed or cancelled
  const stopped = current === undefined;

  return (
    <div className="mx-auto mt-[40px] max-w-[900px]">
      <div className="flex flex-wrap items-baseline justify-between gap-[8px] border-b border-[#E5E5E5] pb-[16px]">
        <div>
          <p className="text-[13px] uppercase leading-[18px] text-[#6B6B6B]">Order</p>
          <p className="text-[20px] font-bold leading-[26px] text-black">{order.orderNumber}</p>
        </div>
        <p className="text-[14px] leading-[20px] text-[#6B6B6B]">Placed on {formatDate(order.createdAt)}</p>
      </div>

      {stopped ? (
        <StoppedNotice status={order.status} />
      ) : (
        <ol className="mt-[32px] flex flex-col md:flex-row">
          {steps.map((step, index) => {
            const reached = index <= current;
            const isCurrent = index === current;
            const isLast = index === steps.length - 1;
            const Icon = step.icon;

            return (
              <li
                key={step.title}
                className="relative flex gap-[16px] pb-[28px] last:pb-0 md:flex-1 md:flex-col md:gap-[12px] md:pb-0"
              >
                {!isLast && (
                  <span
                    aria-hidden
                    className={`absolute left-[19px] top-[40px] block h-[calc(100%-40px)] w-[2px] md:left-[40px] md:top-[19px] md:h-[2px] md:w-[calc(100%-40px)] ${
                      index < current ? "bg-black" : "bg-[#D4D4D4]"
                    }`}
                  />
                )}
                <div
                  className={`relative flex size-[40px] shrink-0 items-center justify-center rounded-full ${
                    reached ? "bg-black text-white" : "bg-[#E5E5E5] text-[#6B6B6B]"
                  }`}
                >
                  <Icon strokeWidth={1.75} className="size-[20px]" />
                </div>
                <div className="md:pr-[16px]">
                  <p
                    className={`text-[15px] leading-[20px] ${
                      isCurrent ? "font-bold text-black" : reached ? "font-semibold text-black" : "text-[#6B6B6B]"
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.date && <p className="mt-[2px] text-[12px] leading-[16px] text-[#6B6B6B]">{step.date}</p>}
                  {isCurrent && <p className="mt-[6px] text-[13px] leading-[18px] text-[#3A3A3A]">{step.text}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-[40px] grid gap-[32px] md:grid-cols-[minmax(0,1fr)_260px]">
        <section>
          <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">Items</h2>
          <ul className="mt-[12px] divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
            {order.items.map((item) => (
              <li key={`${item.slug}-${item.size}`} className="flex gap-[14px] py-[14px]">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-[84px] w-[66px] shrink-0 overflow-hidden rounded-[2px] bg-[#E8E4DF]"
                >
                  <Image src={item.image} alt={item.name} fill sizes="66px" className="object-cover" />
                </Link>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold leading-[20px] text-black">{item.name}</p>
                  {item.subtitle && <p className="text-[12px] leading-[16px] text-[#6B6B6B]">{item.subtitle}</p>}
                  <p className="mt-[2px] text-[12px] leading-[16px] text-[#6B6B6B]">
                    Size: {item.size} · Qty: {item.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-[24px]">
          <div>
            <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">Delivering to</h2>
            <p className="mt-[12px] text-[14px] leading-[22px] text-[#3A3A3A]">
              {order.city}, {order.state}
            </p>
          </div>
          <div>
            <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">Total</h2>
            <p className="mt-[12px] text-[20px] font-bold leading-[26px] text-black">{naira(order.amountNgn)}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Orders that are not on the normal path (waiting for payment, failed or cancelled)
function StoppedNotice({ status }: { status: TrackedOrder["status"] }) {
  const isPending = status === "pending";
  const Icon = isPending ? Clock : Ban;
  const title = isPending ? "Waiting for payment" : status === "failed" ? "Payment failed" : "Order cancelled";
  const text = isPending
    ? "We haven't received your payment yet. Orders that are not paid within 30 minutes are cancelled automatically."
    : status === "failed"
      ? "Your payment did not go through and you have not been charged. You can place the order again."
      : "This order was cancelled. If you think this is a mistake, please contact us.";

  return (
    <div className="mt-[32px] flex items-start gap-[16px] rounded-[4px] bg-[#F2F2F2] p-[20px]">
      <div className="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-black text-white">
        <Icon strokeWidth={1.75} className="size-[20px]" />
      </div>
      <div>
        <p className="text-[15px] font-bold leading-[20px] text-black">{title}</p>
        <p className="mt-[4px] text-[14px] leading-[20px] text-[#3A3A3A]">{text}</p>
      </div>
    </div>
  );
}