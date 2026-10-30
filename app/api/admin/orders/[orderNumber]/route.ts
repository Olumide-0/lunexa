import { z } from "zod";
import type { Types } from "mongoose";
import { getAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { nextStatuses } from "@/lib/order-status";
import { Order, type OrderDoc } from "@/models/Order";
import { Product } from "@/models/Product";

type OrderLean = OrderDoc & { _id: Types.ObjectId };

const bodySchema = z.object({ status: z.enum(["shipped", "delivered", "cancelled"]) });

// PATCH /api/admin/orders/LX-XXXXXXXX   body: { "status": "shipped" }
export async function PATCH(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  // Admins only. Everyone else gets the same "not found" as a missing route.
  const admin = await getAdmin();
  if (!admin) return Response.json({ message: "Not found" }, { status: 404 });

  const { orderNumber } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "Invalid status" }, { status: 400 });
  const to = parsed.data.status;

  await connectDB();
  const order = await Order.findOne({ orderNumber }).lean<OrderLean | null>();
  if (!order) return Response.json({ message: "Order not found" }, { status: 404 });

  if (!nextStatuses[order.status]?.includes(to)) {
    return Response.json({ message: `An order that is "${order.status}" can't be changed to "${to}"` }, { status: 409 });
  }

  // Only change it if it is still in the status we just read (two admins clicking at once can't double-apply)
  const updated = await Order.findOneAndUpdate(
    { orderNumber, status: order.status },
    { $set: { status: to } },
    { new: true }
  );
  if (!updated) return Response.json({ message: "This order just changed. Refresh and try again." }, { status: 409 });

  // Cancelling gives the reserved stock back
  if (to === "cancelled") {
    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    }
  }

  return Response.json({ status: to });
}