import { NextResponse } from "next/server";
import { z } from "zod";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";

type OrderLean = OrderDoc & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

// Order numbers look like "LX-C4BD413A"
const bodySchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^LX-[A-Z0-9]{4,16}$/),
});

// Public: anyone with an order number can see where the order is.
// So this only sends back what the customer needs: status, dates, items and the city.
// It never sends the street address, phone number or email.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter your order number, like LX-1A2B3C4D." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your order number, like LX-1A2B3C4D." }, { status: 400 });
  }

  await connectDB();
  const order = await Order.findOne({ orderNumber: parsed.data.orderNumber }).lean<OrderLean | null>();
  if (!order) {
    return NextResponse.json(
      { error: "We couldn't find an order with that number. Check it and try again." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.payment?.paidAt ?? null,
    city: order.shippingAddress.city,
    state: order.shippingAddress.state,
    amountNgn: order.amountNgn,
    items: order.items.map((item) => ({
      slug: item.slug,
      name: item.name,
      subtitle: item.subtitle ?? null,
      image: item.image,
      size: item.size,
      quantity: item.quantity,
    })),
  });
}