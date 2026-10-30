import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Types } from "mongoose";
import { getSessionUserId } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";

export const metadata: Metadata = {
  title: "My orders | Lunexa",
};

type OrderLean = OrderDoc & { _id: Types.ObjectId; createdAt: Date };

// Naira, whole numbers (the amount we charged)
const naira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

const date = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(value);

const statusLabels: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Reads the login cookie and the database, so it sits inside <Suspense> (below)
async function OrdersContent() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/"); // not signed in

  await connectDB();
  // Only this customer's orders, newest first
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean<OrderLean[]>();

  return (
    <div className="container mx-auto w-11/12 pb-[80px] pt-[32px]">
      <h1 className="text-[28px] font-bold uppercase leading-[34px] text-black">My orders</h1>

      {orders.length === 0 ? (
        <div className="py-[60px] text-center">
          <p className="text-[14px] leading-[20px] text-[#6B6B6B]">You haven&apos;t placed any orders yet.</p>
          <div className="mt-[24px] flex justify-center gap-[12px]">
            <Link href="/women" className="flex h-[48px] items-center rounded-full bg-black px-[28px] text-[15px] font-semibold text-white">
              Shop Womens
            </Link>
            <Link href="/men" className="flex h-[48px] items-center rounded-full bg-black px-[28px] text-[15px] font-semibold text-white">
              Shop Mens
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-[24px] space-y-[16px]">
          {orders.map((order) => (
            <li key={order.orderNumber}>
              <Link
                href={`/orders/${order.orderNumber}`}
                className="block rounded-[4px] border border-[#E5E5E5] p-[20px] transition-colors hover:border-black"
              >
                <div className="flex flex-wrap items-start justify-between gap-[12px]">
                  <div>
                    <p className="text-[15px] font-bold leading-[20px] text-black">{order.orderNumber}</p>
                    <p className="mt-[2px] text-[12px] leading-[16px] text-[#6B6B6B]">{date(order.createdAt)}</p>
                  </div>
                  <span className="bg-[#F2F2F2] px-[8px] py-[4px] text-[11px] font-bold uppercase leading-[14px] text-black">
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>

                <div className="mt-[16px] flex items-end justify-between gap-[16px]">
                  <div className="flex gap-[8px]">
                    {order.items.slice(0, 4).map((item) => (
                      <div key={`${item.slug}-${item.size}`} className="relative h-[72px] w-[56px] overflow-hidden rounded-[2px] bg-[#E8E4DF]">
                        <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex h-[72px] w-[56px] items-center justify-center rounded-[2px] bg-[#F2F2F2] text-[12px] font-semibold text-black">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <p className="text-[16px] font-bold leading-[22px] text-black">{naira(order.amountNgn)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrdersFallback() {
  return <div className="container mx-auto h-[400px] w-11/12 animate-pulse bg-[#F2F2F2]" />;
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersFallback />}>
      <OrdersContent />
    </Suspense>
  );
}