import Link from "next/link";
import { Suspense } from "react";
import type { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { formatDate, naira, statusLabels } from "@/lib/order-status";
import { Order, type OrderDoc } from "@/models/Order";
import { Product } from "@/models/Product";

type RecentOrder = OrderDoc & { _id: Types.ObjectId; createdAt: Date };

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-[4px] border border-[#E5E5E5] bg-white p-[20px]">
      <p className="text-[12px] font-semibold uppercase leading-[16px] text-[#6B6B6B]">{label}</p>
      <p className="mt-[8px] text-[26px] font-bold leading-[32px] text-black">{value}</p>
      {note && <p className="mt-[2px] text-[12px] leading-[16px] text-[#6B6B6B]">{note}</p>}
    </div>
  );
}

async function DashboardContent() {
  await requireAdmin(); // every admin page checks again; never rely on the layout alone

  await connectDB();
  const [byStatus, productCount, lowStockCount, recent] = await Promise.all([
    Order.aggregate<{ _id: string; count: number; total: number }>([
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amountNgn" } } },
    ]),
    Product.countDocuments({}),
    Product.countDocuments({ stock: { $lte: 5 } }),
    Order.find().sort({ createdAt: -1 }).limit(8).lean<RecentOrder[]>(),
  ]);

  const count = (status: string) => byStatus.find((row) => row._id === status)?.count ?? 0;
  const orderTotal = byStatus.reduce((sum, row) => sum + row.count, 0);
  // Money we actually received: paid, shipped and delivered orders
  const revenue = byStatus
    .filter((row) => ["paid", "shipped", "delivered"].includes(row._id))
    .reduce((sum, row) => sum + row.total, 0);
  const toShip = count("paid");

  return (
    <>
      <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">Dashboard</h1>

      <div className="mt-[20px] grid grid-cols-2 gap-[12px] xl:grid-cols-4">
        <StatCard label="Revenue" value={naira(revenue)} note="Paid, shipped and delivered" />
        <StatCard label="Orders" value={String(orderTotal)} note={`${toShip} paid, waiting to ship`} />
        <StatCard label="Products" value={String(productCount)} />
        <StatCard label="Low stock" value={String(lowStockCount)} note="5 or fewer left" />
      </div>

      <div className="mt-[32px] flex items-center justify-between">
        <h2 className="text-[16px] font-bold uppercase leading-[22px] text-black">Recent orders</h2>
        <Link href="/admin/orders" className="text-[14px] text-black underline underline-offset-[3px] hover:opacity-70">
          View all orders
        </Link>
      </div>
      <div className="mt-[12px] overflow-x-auto rounded-[4px] border border-[#E5E5E5] bg-white">
        {recent.length === 0 ? (
          <p className="p-[20px] text-[14px] text-[#6B6B6B]">No orders yet.</p>
        ) : (
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[12px] uppercase text-[#6B6B6B]">
                <th className="px-[16px] py-[12px] font-semibold">Order</th>
                <th className="px-[16px] py-[12px] font-semibold">Customer</th>
                <th className="px-[16px] py-[12px] font-semibold">Date</th>
                <th className="px-[16px] py-[12px] font-semibold">Status</th>
                <th className="px-[16px] py-[12px] text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr key={order.orderNumber} className="border-b border-[#F2F2F2] last:border-b-0">
                  <td className="px-[16px] py-[12px] font-semibold text-black">
                    <Link href={`/admin/orders/${order.orderNumber}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-[16px] py-[12px] text-black">{order.shippingAddress.fullName}</td>
                  <td className="px-[16px] py-[12px] text-[#6B6B6B]">{formatDate(order.createdAt)}</td>
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
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse bg-[#F2F2F2]" />}>
      <DashboardContent />
    </Suspense>
  );
}