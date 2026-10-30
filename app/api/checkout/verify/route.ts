import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { Order, type OrderDoc } from "@/models/Order";
import { Product } from "@/models/Product";

type OrderLean = OrderDoc & { _id: Types.ObjectId };

// GET /api/checkout/verify?reference=LX-XXXXXXXX
// Paystack sends the customer here after they pay (or give up). We ask Paystack what really
// happened, update the order, and send the customer to their order page.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref");
  if (!reference) return Response.redirect(new URL("/", url.origin));

  await connectDB();
  const order = await Order.findOne({ "payment.reference": reference }).lean<OrderLean | null>();
  if (!order) return Response.redirect(new URL("/", url.origin));

  const orderPage = new URL(`/orders/${order.orderNumber}`, url.origin);

  // Already handled (for example the customer refreshed this page): nothing more to do
  if (order.status !== "pending") return Response.redirect(orderPage);

  try {
    const transaction = await verifyTransaction(reference);

    if (transaction.status === "success") {
      // The amount must match exactly, so nobody can pay less than the order total
      if (transaction.currency === "NGN" && transaction.amount === order.amountNgn * 100) {
        await Order.updateOne(
          { _id: order._id, status: "pending" }, // only if still pending, so it can't run twice
          { $set: { status: "paid", "payment.paidAt": new Date() } }
        );
      } else {
        console.error(`Payment ${reference}: amount or currency does not match the order`, transaction);
      }
    } else if (transaction.status === "failed") {
      const result = await Order.updateOne({ _id: order._id, status: "pending" }, { $set: { status: "failed" } });
      if (result.modifiedCount === 1) {
        // The order will never be paid, so give the reserved stock back
        for (const item of order.items) {
          await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
        }
      }
    }
    // Any other status (abandoned, ongoing...) means they haven't paid yet: the order stays "pending"
  } catch (error) {
    console.error("Verify error:", error);
  }

  return Response.redirect(orderPage);
}