import Link from "next/link";
import { Suspense } from "react";
import type { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { formatDate, naira, statusLabels } from "@/lib/order-status";
import { Order, type OrderDoc } from "@/models/Order";

type OrderLean = OrderDoc & { _id: Types.ObjectId; createdAt: Date };

const tabs: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "paid", label: "To ship" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "pending", label: "Awaiting payment" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
];

async function OrdersContent({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  await requireAdmin();

  const { status: rawStatus } = await searchParams;
  const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
  const activeStatus = status && status in statusLabels ? status : "";

  await connectDB();
  const [orders, counts] = await Promise.all([
    Order.find(activeStatus ? { status: activeStatus } : {})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean<OrderLean[]>(),
    Order.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const countFor = (value: string) =>
    value ? (counts.find((row) => row._id === value)?.count ?? 0) : counts.reduce((sum, row) => sum + row.count, 0);

  return (
    <>
      <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">Orders</h1>

      <div className="mt-[16px] flex flex-wrap gap-[8px]">
        {tabs.map((tab) => {
          const active = tab.value === activeStatus;
          return (
            <Link
              key={tab.value || "all"}
              href={tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders"}
              aria-current={active ? "page" : undefined}
              className={`flex h-[36px] items-center gap-[6px] rounded-full px-[14px] text-[13px] transition-colors ${
                active ? "bg-black font-semibold text-white" : "bg-white text-black hover:bg-[#EBEBEB]"
              }`}
            >
              {tab.label}
              <span className={active ? "text-white/70" : "text-[#6B6B6B]"}>{countFor(tab.value)}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-[16px] overflow-x-auto rounded-[4px] border border-[#E5E5E5] bg-white">
        {orders.length === 0 ? (
          <p className="p-[20px] text-[14px] text-[#6B6B6B]">No orders here.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[12px] uppercase text-[#6B6B6B]">
                <th className="px-[16px] py-[12px] font-semibold">Order</th>
                <th className="px-[16px] py-[12px] font-semibold">Customer</th>
                <th className="px-[16px] py-[12px] font-semibold">Date</th>
                <th className="px-[16px] py-[12px] font-semibold">Items</th>
                <th className="px-[16px] py-[12px] font-semibold">Status</th>
                <th className="px-[16px] py-[12px] text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderNumber} className="border-b border-[#F2F2F2] last:border-b-0 hover:bg-[#FAFAFA]">
                  <td className="px-[16px] py-[12px] font-semibold text-black">
                    <Link href={`/admin/orders/${order.orderNumber}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-[16px] py-[12px] text-black">{order.shippingAddress.fullName}</td>
                  <td className="px-[16px] py-[12px] text-[#6B6B6B]">{formatDate(order.createdAt)}</td>
                  <td className="px-[16px] py-[12px] text-[#6B6B6B]">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="px-[16px] py-[12px]">
                    <span className="bg-[#F2F2F2] px-[8px] py-[4px] text-[11px] font-bold uppercase text-black">
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-[16px] py-[12px] text-right font-semibold text-black">{naira(order.amountNgn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {orders.length === 100 && (
        <p className="mt-[8px] text-[12px] text-[#6B6B6B]">Showing the latest 100 orders.</p>
      )}
    </>
  );
}

export default function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse bg-[#F2F2F2]" />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}