import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import type { Types } from "mongoose";
import { RangeSelect } from "@/components/admin/range-select";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { formatDate, naira, statusLabels } from "@/lib/order-status";
import { Order, type OrderDoc } from "@/models/Order";
import { Product, type ProductDoc } from "@/models/Product";

type RecentOrder = OrderDoc & { _id: Types.ObjectId; createdAt: Date };
type LowStockProduct = Pick<ProductDoc, "name" | "slug" | "stock" | "images">;
type Day = { key: string; label: string; total: number; count: number };

// Revenue chart ranges. "bucket" = how many days one bar covers (keeps long ranges readable)
const RANGES = [
  { value: "7d", label: "Last 7 days", days: 7, bucket: 1 },
  { value: "1m", label: "Last 1 month", days: 30, bucket: 1 },
  { value: "3m", label: "Last 3 months", days: 90, bucket: 7 },
  { value: "6m", label: "Last 6 months", days: 180, bucket: 7 },
  { value: "1y", label: "Last 1 year", days: 365, bucket: 30 },
];
const DEFAULT_RANGE = "1m";
const LOW_STOCK_AT = 5; // "low" means this many or fewer left
const LOW_STOCK_SHOWN = 8;
const PAID_STATUSES = ["paid", "shipped", "delivered"]; // money we actually received

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

// Order of the status bar and its colours (full class names, so Tailwind can find them)
const statusOrder = ["paid", "shipped", "delivered", "pending", "cancelled", "failed"];
const statusStyle: Record<string, { fill: string; dot: string }> = {
  paid: { fill: "fill-[#F59E0B]", dot: "bg-[#F59E0B]" },
  shipped: { fill: "fill-[#3B82F6]", dot: "bg-[#3B82F6]" },
  delivered: { fill: "fill-[#16A34A]", dot: "bg-[#16A34A]" },
  pending: { fill: "fill-[#9CA3AF]", dot: "bg-[#9CA3AF]" },
  cancelled: { fill: "fill-[#EF4444]", dot: "bg-[#EF4444]" },
  failed: { fill: "fill-[#7F1D1D]", dot: "bg-[#7F1D1D]" },
};

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-[4px] border border-[#E5E5E5] bg-white p-[20px]">
      <p className="text-[12px] font-semibold uppercase leading-[16px] text-[#6B6B6B]">{label}</p>
      <p className="mt-[8px] text-[26px] font-bold leading-[32px] text-black">{value}</p>
      {note && <p className="mt-[2px] text-[12px] leading-[16px] text-[#6B6B6B]">{note}</p>}
    </div>
  );
}

function Panel({
  title,
  action,
  className = "",
  children,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-[4px] border border-[#E5E5E5] bg-white p-[20px] ${className}`}>
      <div className="flex items-center justify-between gap-[12px]">
        <h2 className="text-[14px] font-bold uppercase leading-[20px] text-black">{title}</h2>
        {action}
      </div>
      <div className="mt-[16px]">{children}</div>
    </section>
  );
}

/* ---------- Revenue per day (bar chart) ---------- */
function RevenueChart({ days, bucket }: { days: Day[]; bucket: number }) {
  const max = Math.max(...days.map((day) => day.total), 1);
  const step = 300 / days.length; // every bar gets an equal slice of the 300-wide drawing
  const barWidth = step * 0.7;

  return (
    <div>
      <p className="text-[12px] leading-[16px] text-[#6B6B6B]">Highest day: {naira(max)}</p>
      <svg
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        role="img"
        aria-label="Revenue chart"
        className="mt-[8px] h-[180px] w-full"
      >
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" x2="300" y1={y} y2={y} className="stroke-[#F2F2F2]" strokeWidth="0.5" />
        ))}
        <line x1="0" x2="300" y1="100" y2="100" className="stroke-[#E5E5E5]" strokeWidth="0.5" />
        {days.map((day, index) => {
          if (day.total === 0) return null;
          const height = Math.max((day.total / max) * 96, 1.5);
          return (
            <rect
              key={day.key}
              x={index * step + step * 0.15}
              y={100 - height}
              width={barWidth}
              height={height}
              className="fill-black"
            >
              <title>{`${bucket > 1 ? `From ${day.label} (${bucket} days)` : day.label}: ${naira(day.total)} from ${day.count} order${day.count === 1 ? "" : "s"}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-[6px] flex justify-between text-[11px] leading-[14px] text-[#6B6B6B]">
        <span>{days[0].label}</span>
        <span>{days[Math.floor(days.length / 2)].label}</span>
        <span>{days[days.length - 1].label}</span>
      </div>
    </div>
  );
}

/* ---------- One bar split into coloured parts ---------- */
function SegmentBar({
  segments,
  label,
}: {
  segments: { key: string; value: number; fill: string; title: string }[];
  label: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total === 0) return <div className="h-[12px] rounded-full bg-[#F2F2F2]" />;

  const widths = segments.map((segment) => (segment.value / total) * 100);
  const starts = widths.map((_, index) => widths.slice(0, index).reduce((sum, width) => sum + width, 0));

  return (
    <svg
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className="h-[12px] w-full overflow-hidden rounded-full bg-[#F2F2F2]"
    >
      {segments.map((segment, index) => (
        <rect key={segment.key} x={starts[index]} y={0} width={widths[index]} height={4} className={segment.fill}>
          <title>{segment.title}</title>
        </rect>
      ))}
    </svg>
  );
}

function LegendRow({ dot, label, value, note }: { dot: string; label: string; value: string; note?: string }) {
  return (
    <li className="flex items-center gap-[10px] text-[13px] leading-[18px]">
      <span className={`size-[10px] shrink-0 rounded-full ${dot}`} />
      <span className="flex-1 text-black">{label}</span>
      {note && <span className="text-[#6B6B6B]">{note}</span>}
      <span className="w-[28px] text-right font-semibold text-black">{value}</span>
    </li>
  );
}

async function DashboardContent({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdmin(); // every admin page checks again; never rely on the layout alone

  const { range: rangeParam } = await searchParams;
  const range = RANGES.find((item) => item.value === rangeParam) ?? RANGES.find((item) => item.value === DEFAULT_RANGE)!;

  await connectDB();

  // Start of the day, range.days - 1 days ago (UTC)
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (range.days - 1));

  const [byStatus, daily, productCount, outCount, lowCount, lowStock, recent] = await Promise.all([
    Order.aggregate<{ _id: string; count: number; total: number }>([
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amountNgn" } } },
    ]),
    // Money received per day: paid, shipped and delivered orders, counted on the day they were paid
    Order.aggregate<{ _id: string; total: number; count: number }>([
      { $match: { status: { $in: PAID_STATUSES } } },
      { $addFields: { paidDate: { $ifNull: ["$payment.paidAt", "$createdAt"] } } },
      { $match: { paidDate: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidDate" } },
          total: { $sum: "$amountNgn" },
          count: { $sum: 1 },
        },
      },
    ]),
    Product.countDocuments({}),
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({ stock: { $gte: 1, $lte: LOW_STOCK_AT } }),
    Product.find({ stock: { $lte: LOW_STOCK_AT } })
      .sort({ stock: 1, name: 1 })
      .limit(LOW_STOCK_SHOWN)
      .select("name slug stock images")
      .lean<LowStockProduct[]>(),
    Order.find().sort({ createdAt: -1 }).limit(8).lean<RecentOrder[]>(),
  ]);

  const count = (status: string) => byStatus.find((row) => row._id === status)?.count ?? 0;
  const orderTotal = byStatus.reduce((sum, row) => sum + row.count, 0);
  const revenue = byStatus
    .filter((row) => PAID_STATUSES.includes(row._id))
    .reduce((sum, row) => sum + row.total, 0);
  const toShip = count("paid");

  // One entry for every day in the chart, with 0 for days without sales
  const dailyByKey = new Map(daily.map((row) => [row._id, row]));
  const days: Day[] = Array.from({ length: range.days }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    const row = dailyByKey.get(key);
    return { key, label: dayFormat.format(date), total: row?.total ?? 0, count: row?.count ?? 0 };
  });
  const periodRevenue = days.reduce((sum, day) => sum + day.total, 0);
  const periodOrders = days.reduce((sum, day) => sum + day.count, 0);

  // Long ranges: join days into bigger bars (a week or about a month each)
  const bars: Day[] = [];
  for (let start = 0; start < days.length; start += range.bucket) {
    const group = days.slice(start, start + range.bucket);
    bars.push({
      key: group[0].key,
      label: group[0].label,
      total: group.reduce((sum, day) => sum + day.total, 0),
      count: group.reduce((sum, day) => sum + day.count, 0),
    });
  }

  const statusRows = statusOrder
    .map((status) => byStatus.find((row) => row._id === status))
    .filter((row): row is { _id: string; count: number; total: number } => Boolean(row));

  const lowStockCount = outCount + lowCount;
  const inStockCount = Math.max(productCount - lowStockCount, 0);

  return (
    <>
      <h1 className="text-[24px] font-bold uppercase leading-[30px] text-black">Dashboard</h1>

      <div className="mt-[20px] grid grid-cols-2 gap-[12px] xl:grid-cols-4">
        <StatCard label="Revenue" value={naira(revenue)} note="Paid, shipped and delivered" />
        <StatCard label="Orders" value={String(orderTotal)} note={`${toShip} paid, waiting to ship`} />
        <StatCard label="Products" value={String(productCount)} />
        <StatCard label="Low stock" value={String(lowStockCount)} note={`${LOW_STOCK_AT} or fewer left`} />
      </div>

      {/* Revenue + orders by status */}
      <div className="mt-[12px] grid gap-[12px] lg:grid-cols-3">
        <Panel
          title="Revenue"
          className="lg:col-span-2"
          action={<RangeSelect value={range.value} options={RANGES.map(({ value, label }) => ({ value, label }))} />}
        >
          <p className="-mt-[4px] mb-[12px] text-[13px] leading-[18px] text-[#6B6B6B]">
            <span className="font-semibold text-black">{naira(periodRevenue)}</span> from {periodOrders} order
            {periodOrders === 1 ? "" : "s"} · {range.label.toLowerCase()}
          </p>
          {periodOrders === 0 ? (
            <p className="py-[40px] text-center text-[14px] text-[#6B6B6B]">No paid orders in this period.</p>
          ) : (
            <RevenueChart days={bars} bucket={range.bucket} />
          )}
        </Panel>

        <Panel title="Orders by status">
          <SegmentBar
            label="Orders by status"
            segments={statusRows.map((row) => ({
              key: row._id,
              value: row.count,
              fill: statusStyle[row._id]?.fill ?? "fill-[#9CA3AF]",
              title: `${statusLabels[row._id] ?? row._id}: ${row.count}`,
            }))}
          />
          {statusRows.length === 0 ? (
            <p className="mt-[16px] text-[14px] text-[#6B6B6B]">No orders yet.</p>
          ) : (
            <ul className="mt-[16px] grid gap-[10px]">
              {statusRows.map((row) => (
                <LegendRow
                  key={row._id}
                  dot={statusStyle[row._id]?.dot ?? "bg-[#9CA3AF]"}
                  label={statusLabels[row._id] ?? row._id}
                  note={naira(row.total)}
                  value={String(row.count)}
                />
              ))}
            </ul>
          )}
          <p className="mt-[12px] text-[11px] leading-[16px] text-[#6B6B6B]">
            The amount beside Cancelled and Failed is money that did not come in.
          </p>
        </Panel>
      </div>

      {/* Stock health + low stock list */}
      <div className="mt-[12px] grid gap-[12px] lg:grid-cols-3">
        <Panel title="Stock health">
          <SegmentBar
            label="Stock health"
            segments={[
              { key: "ok", value: inStockCount, fill: "fill-[#16A34A]", title: `In stock: ${inStockCount}` },
              { key: "low", value: lowCount, fill: "fill-[#F59E0B]", title: `Low stock: ${lowCount}` },
              { key: "out", value: outCount, fill: "fill-[#EF4444]", title: `Out of stock: ${outCount}` },
            ]}
          />
          <ul className="mt-[16px] grid gap-[10px]">
            <LegendRow dot="bg-[#16A34A]" label="In stock" value={String(inStockCount)} />
            <LegendRow dot="bg-[#F59E0B]" label={`Low (1 to ${LOW_STOCK_AT} left)`} value={String(lowCount)} />
            <LegendRow dot="bg-[#EF4444]" label="Out of stock" value={String(outCount)} />
          </ul>
        </Panel>

        <Panel
          title="Low stock"
          className="lg:col-span-2"
          action={
            <Link href="/admin/products" className="text-[14px] text-black underline underline-offset-[3px] hover:opacity-70">
              All products
            </Link>
          }
        >
          {lowStock.length === 0 ? (
            <p className="py-[24px] text-center text-[14px] text-[#6B6B6B]">Nothing is running low.</p>
          ) : (
            <>
              <ul className="divide-y divide-[#F2F2F2]">
                {lowStock.map((product) => (
                  <li key={product.slug} className="flex items-center gap-[12px] py-[10px] first:pt-0 last:pb-0">
                    <div className="relative size-[40px] shrink-0 overflow-hidden rounded-[4px] bg-[#F2F2F2]">
                      {product.images[0] && <Image src={product.images[0]} alt="" fill sizes="40px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-black">{product.name}</p>
                      <p className="truncate text-[12px] text-[#6B6B6B]">{product.slug}</p>
                    </div>
                    {product.stock === 0 ? (
                      <span className="bg-[#FDECEC] px-[8px] py-[4px] text-[11px] font-bold uppercase text-[#C62828]">Out of stock</span>
                    ) : (
                      <span className="bg-[#FEF3C7] px-[8px] py-[4px] text-[11px] font-bold uppercase text-[#92400E]">
                        {product.stock} left
                      </span>
                    )}
                    <Link
                      href={`/admin/products/${product.slug}`}
                      className="flex h-[32px] items-center rounded-[4px] px-[10px] text-[13px] text-black transition-colors hover:bg-[#F2F2F2]"
                    >
                      Restock
                    </Link>
                  </li>
                ))}
              </ul>
              {lowStockCount > lowStock.length && (
                <p className="mt-[12px] text-[12px] text-[#6B6B6B]">
                  Showing {lowStock.length} of {lowStockCount} products that are low or out of stock.
                </p>
              )}
            </>
          )}
        </Panel>
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

export default function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse bg-[#F2F2F2]" />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}