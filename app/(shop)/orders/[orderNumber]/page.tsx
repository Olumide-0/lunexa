import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Check, Clock, X } from "lucide-react";
import type { Types } from "mongoose";
import ClearCart from "@/components/checkout/clear-cart";
import { getSessionUserId } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";

export const metadata: Metadata = {
  title: "Your order | Lunexa",
};

type OrderLean = OrderDoc & { _id: Types.ObjectId };
type Props = { params: Promise<{ orderNumber: string }> };

// Naira, whole numbers (the amount we charge)
const naira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

// The part that reads the URL and the login cookie. It sits inside <Suspense> (below).
async function OrderContent({ params }: Props) {
  const { orderNumber } = await params;

  const userId = await getSessionUserId();
  if (!userId) redirect("/"); // not signed in

  await connectDB();
  // Only the person who placed the order can see it
  const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase(), user: userId }).lean<OrderLean | null>();
  if (!order) notFound();

  const { shippingAddress: a } = order;
  const isTestKey = process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_test_") ?? false;

  return (
    <div className="container mx-auto w-11/12 pb-[80px] pt-[40px]">
      {/* The top of the page changes with the payment status */}
      <div className="flex flex-col items-center text-center">
        <div className="flex size-[56px] items-center justify-center rounded-full bg-black text-white">
          {order.status === "pending" ? (
            <Clock strokeWidth={1.75} className="size-[28px]" />
          ) : order.status === "failed" || order.status === "cancelled" ? (
            <X strokeWidth={2} className="size-[28px]" />
          ) : (
            <Check strokeWidth={2} className="size-[28px]" />
          )}
        </div>
        <h1 className="mt-[20px] text-[28px] font-bold uppercase leading-[34px] text-black">
          {order.status === "pending"
            ? "Payment not completed"
            : order.status === "failed"
              ? "Payment failed"
              : order.status === "cancelled"
                ? "Order cancelled"
                : "Thank you for your order"}
        </h1>
        <p className="mt-[8px] text-[14px] leading-[20px] text-[#6B6B6B]">
          Order <span className="font-semibold text-black">{order.orderNumber}</span>{" "}
          {order.status === "pending"
            ? "is waiting for payment."
            : order.status === "failed"
              ? "was not paid. You have not been charged."
              : order.status === "cancelled"
                ? "was cancelled."
                : "is confirmed."}
        </p>
        {order.status === "paid" && isTestKey && (
          <p className="mt-[8px] text-[13px] leading-[18px] text-[#6B6B6B]">Test mode: no real money was taken.</p>
        )}
        {order.status === "pending" && order.payment?.authorizationUrl && (
          <a
            href={order.payment.authorizationUrl}
            className="mt-[20px] flex h-[48px] items-center rounded-full bg-black px-[32px] text-[15px] font-semibold text-white transition-colors hover:bg-[#333333]"
          >
            Complete payment
          </a>
        )}
        {order.status === "failed" && (
          <Link
            href="/checkout"
            className="mt-[20px] flex h-[48px] items-center rounded-full bg-black px-[32px] text-[15px] font-semibold text-white transition-colors hover:bg-[#333333]"
          >
            Try again
          </Link>
        )}
      </div>

      {/* Once paid, the bag is emptied */}
      {order.status === "paid" && <ClearCart productIds={order.items.map((item) => String(item.product))} />}

      <div className="mx-auto mt-[40px] grid max-w-[900px] gap-[32px] md:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">Items</h2>
          <ul className="mt-[12px] divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
            {order.items.map((item) => (
              <li key={`${item.slug}-${item.size}`} className="flex gap-[14px] py-[14px]">
                <Link href={`/products/${item.slug}`} className="relative h-[84px] w-[66px] shrink-0 overflow-hidden rounded-[2px] bg-[#E8E4DF]">
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
            <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">Delivery</h2>
            <address className="mt-[12px] text-[14px] not-italic leading-[22px] text-[#3A3A3A]">
              {a.fullName}
              <br />
              {a.address}
              <br />
              {a.city}, {a.state} {a.postalCode}
              <br />
              {a.country}
              <br />
              {a.phone}
            </address>
          </div>
          <div>
            <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">Total</h2>
            <p className="mt-[12px] text-[20px] font-bold leading-[26px] text-black">{naira(order.amountNgn)}</p>
            <p className="mt-[2px] text-[12px] leading-[16px] text-[#6B6B6B]">
              Shipping: {order.shippingUsd === 0 ? "Free" : "included"}
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-[40px] flex justify-center">
        <Link href="/" className="flex h-[48px] items-center rounded-full bg-black px-[32px] text-[15px] font-semibold text-white transition-colors hover:bg-[#333333]">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

function OrderFallback() {
  return <div className="container mx-auto h-[400px] w-11/12 animate-pulse bg-[#F2F2F2]" />;
}

export default function OrderPage({ params }: Props) {
  return (
    <Suspense fallback={<OrderFallback />}>
      <OrderContent params={params} />
    </Suspense>
  );
}