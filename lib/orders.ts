import type { Types } from "mongoose";
import { verifyTransaction } from "@/lib/paystack";
import { Order, type OrderDoc } from "@/models/Order";
import { Product } from "@/models/Product";

// An order that is still waiting for payment after this many minutes is cleaned up
export const PENDING_ORDER_MINUTES = 30;

type OrderLean = OrderDoc & { _id: Types.ObjectId };

// Puts the reserved stock back on the shelf
async function restoreStock(items: { product: Types.ObjectId; quantity: number }[]) {
  for (const item of items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
  }
}

// Paystack only sends the customer back to us after a SUCCESSFUL payment. If someone closes the
// payment page or their card is declined, we never hear about it, so their order would stay
// "pending" and hold the stock forever. This cleans those up. It runs whenever someone checks out.
export async function expirePendingOrders() {
  const cutoff = new Date(Date.now() - PENDING_ORDER_MINUTES * 60 * 1000);
  const stale = await Order.find({ status: "pending", createdAt: { $lt: cutoff } } as Record<string, unknown>)
    .limit(20)
    .lean<OrderLean[]>();

  for (const order of stale) {
    try {
      const reference = order.payment?.reference;

      if (reference) {
        // Ask Paystack first: maybe the customer did pay and just never came back
        let transaction;
        try {
          transaction = await verifyTransaction(reference);
        } catch {
          continue; // couldn't reach Paystack, so leave this order alone and try again next time
        }

        if (
          transaction.status === "success" &&
          transaction.currency === "NGN" &&
          transaction.amount === order.amountNgn * 100
        ) {
          await Order.updateOne(
            { _id: order._id, status: "pending" },
            { $set: { status: "paid", "payment.paidAt": new Date() } }
          );
          continue;
        }
      }

      // Not paid: cancel the order and give the stock back (only once)
      const result = await Order.updateOne({ _id: order._id, status: "pending" }, { $set: { status: "cancelled" } });
      if (result.modifiedCount === 1) await restoreStock(order.items);
    } catch (error) {
      console.error("Could not clean up order", order.orderNumber, error);
    }
  }
}