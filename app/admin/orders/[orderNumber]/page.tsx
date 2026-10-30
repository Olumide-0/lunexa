import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import type { Types } from "mongoose";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { dollars, formatDateTime, naira, nextStatuses, statusLabels } from "@/lib/order-status";
import { Order, type OrderDoc } from "@/models/Order";
import { User } from "@/models/User";

type OrderLean = OrderDoc & { _id: Types.ObjectId; createdAt: Date };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-[16px] py-[6px] text-[14px] leading-[20px]">
      <dt className="text-[#6B6B6B]">{label}</dt>
      <dd className="text-right text-black">{value}</dd>
    </div>
  );
}

async function OrderContent({ params }: { params: Promise<{ orderNumber: string }> }) {
  await requireAdmin();

  const { orderNumber } = await params;
  await connectDB();
  const order = await Order.findOne({ orderNumber }).lean<OrderLean | null>();
  if (!order) notFound();

  const customer = await User.findById(order.user).select("email").lean<{ email: string } | null>();
  const address = order.shippingAddress;
  const options = nextStatuses[order.status] ?? [];
  const wasPaid = order.status === "paid";

  return (
    <>
      <Link href="/admin/orders" className="inline-flex items-center gap-[6px] text-[14px] text-black hover:underline">
        <ArrowLeft strokeWidth={1.75} className="size-[16px]" />
        All orders
      </Link>

      <div className="mt-[16px] flex flex-wrap items-center gap-[12px]">
        <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">{order.orderNumber}</h1>
        <span className="bg-white px-[8px] py-[4px] text-[11px] font-bold uppercase text-black">
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>
      <p className="mt-[2px] text-[13px] text-[#6B6B6B]">Placed {formatDateTime(order.createdAt)}</p>

      <div className="mt-[20px] rounded-[4px] border border-[#E5E5E5] bg-white p-[20px]">
        <h2 className="text-[14px] font-bold uppercase leading-[20px] text-black">Update status</h2>
        <div className="mt-[12px]">
          <OrderStatusActions orderNumber={order.orderNumber} options={options} wasPaid={wasPaid} />
        </div>
      </div>

      <div className="mt-[16px] grid gap-[16px] xl:grid-cols-[1fr_360px]">
        <section className="rounded-[4px] border border-[#E5E5E5] bg-white p-[20px]">
          <h2 className="text-[14px] font-bold uppercase leading-[20px] text-black">Items</h2>
          <ul className="mt-[12px] divide-y divide-[#F2F2F2]">
            {order.items.map((item) => (
              <li key={`${item.slug}-${item.size}`} className="flex gap-[14px] py-[12px]">
                <div className="relative h-[88px] w-[70px] shrink-0 overflow-hidden rounded-[2px] bg-[#E8E4DF]">
                  <Image src={item.image} alt={item.name} fill sizes="70px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.slug}`} className="text-[15px] leading-[20px] text-black hover:underline">
                    {item.name}
                  </Link>
                  {item.subtitle && <p className="text-[12px] leading-[16px] text-[#6B6B6B]">{item.subtitle}</p>}
                  <p className="mt-[4px] text-[13px] leading-[18px] text-[#6B6B6B]">
                    Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-[14px] font-semibold text-black">{dollars(item.unitPriceUsd * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-[16px]">
          <section className="rounded-[4px] border border-[#E5E5E5] bg-white p-[20px]">
            <h2 className="text-[14px] font-bold uppercase leading-[20px] text-black">Customer</h2>
            <p className="mt-[10px] text-[14px] leading-[20px] text-black">{address.fullName}</p>
            {customer && <p className="text-[14px] leading-[20px] text-[#6B6B6B]">{customer.email}</p>}
            <p className="text-[14px] leading-[20px] text-[#6B6B6B]">{address.phone}</p>
            <p className="mt-[10px] text-[14px] leading-[20px] text-black">
              {address.address}, {address.city}, {address.state}
              {address.postalCode ? ` ${address.postalCode}` : ""}, {address.country}
            </p>
          </section>

          <section className="rounded-[4px] border border-[#E5E5E5] bg-white p-[20px]">
            <h2 className="text-[14px] font-bold uppercase leading-[20px] text-black">Payment</h2>
            <dl className="mt-[8px]">
              <Row label="Subtotal" value={dollars(order.subtotalUsd)} />
              <Row label="Shipping" value={dollars(order.shippingUsd)} />
              <Row label="Total (USD)" value={dollars(order.totalUsd)} />
              <Row label="Rate used" value={`$1 = ₦${order.exchangeRate}`} />
              <Row label="Charged" value={naira(order.amountNgn)} />
              <Row label="Provider" value={order.payment?.provider ?? "-"} />
              <Row label="Reference" value={order.payment?.reference ?? "-"} />
              <Row label="Paid at" value={order.payment?.paidAt ? formatDateTime(order.payment.paidAt) : "-"} />
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}

export default function AdminOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse bg-[#F2F2F2]" />}>
      <OrderContent params={params} />
    </Suspense>
  );
}