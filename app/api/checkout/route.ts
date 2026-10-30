import { randomBytes } from "node:crypto";
import { z } from "zod";
import type { Types } from "mongoose";
import { getSessionUserId } from "@/lib/auth";
import { SHIPPING_FEE_USD, checkoutSchema } from "@/lib/checkout";
import { connectDB } from "@/lib/db";
import { expirePendingOrders } from "@/lib/orders";
import { initializeTransaction } from "@/lib/paystack";
import { getNgnRate } from "@/lib/rates";
import { Order } from "@/models/Order";
import { Product, type ProductDoc } from "@/models/Product";
import { User } from "@/models/User";

type ProductLean = ProductDoc & { _id: Types.ObjectId };

// Gives back the stock we took, if something goes wrong halfway
async function restoreStock(reserved: { id: Types.ObjectId; quantity: number }[]) {
  for (const { id, quantity } of reserved) {
    await Product.updateOne({ _id: id }, { $inc: { stock: quantity } });
  }
}

// POST /api/checkout
// Checks the bag, reserves the stock, saves a "pending" order and starts a Paystack payment.
// The order only becomes "paid" in /api/checkout/verify, after Paystack confirms the payment.
export async function POST(request: Request) {
  // 1. Must be logged in
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ message: "Please sign in to check out" }, { status: 401 });

  // 2. Check what the browser sent (address + product ids, sizes, quantities. Never prices)
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: "Please check the form", errors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }
  const { items, ...address } = parsed.data;

  try {
    await connectDB();
    await expirePendingOrders(); // frees the stock held by unpaid orders
    const user = await User.findById(userId).select("email").lean<{ email: string } | null>();
    if (!user) return Response.json({ message: "Please sign in to check out" }, { status: 401 });

    // 3. Look every product up in the database. These are the REAL prices and stock.
    const ids = [...new Set(items.map((item) => item.productId.toLowerCase()))];
    const products = await Product.find({ _id: { $in: ids } }).lean<ProductLean[]>();
    const byId = new Map(products.map((product) => [product._id.toString(), product]));

    const lines: {
      product: ProductLean;
      size: string;
      quantity: number;
    }[] = [];
    const totals = new Map<string, number>(); // same product in 2 sizes shares the same stock

    for (const item of items) {
      const product = byId.get(item.productId.toLowerCase());
      if (!product || !product.sizes.includes(item.size)) {
        return Response.json(
          { message: "An item in your bag is no longer available. Remove it and add it again." },
          { status: 400 }
        );
      }
      lines.push({ product, size: item.size, quantity: item.quantity });
      totals.set(product._id.toString(), (totals.get(product._id.toString()) ?? 0) + item.quantity);
    }

    for (const [id, quantity] of totals) {
      const product = byId.get(id)!;
      if (quantity > product.stock) {
        return Response.json(
          {
            message:
              product.stock > 0
                ? `Only ${product.stock} of "${product.name}" left in stock`
                : `"${product.name}" is sold out`,
          },
          { status: 409 }
        );
      }
    }

    // 4. Money, worked out here on the server
    const subtotalUsd = Math.round(lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0) * 100) / 100;
    const shippingUsd = SHIPPING_FEE_USD;
    const totalUsd = Math.round((subtotalUsd + shippingUsd) * 100) / 100;
    const exchangeRate = await getNgnRate();
    const amountNgn = Math.round(totalUsd * exchangeRate);

    // 5. Take the stock. Each update only works if enough is left, so two people
    //    buying the last item at the same time can't both get it.
    const reserved: { id: Types.ObjectId; quantity: number }[] = [];
    for (const [id, quantity] of totals) {
      const product = byId.get(id)!;
      const result = await Product.updateOne({ _id: product._id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } });
      if (result.modifiedCount === 0) {
        await restoreStock(reserved);
        return Response.json({ message: `"${product.name}" just sold out` }, { status: 409 });
      }
      reserved.push({ id: product._id, quantity });
    }

    // 6. Start the Paystack payment, then save the order as "pending"
    const orderNumber = `LX-${randomBytes(4).toString("hex").toUpperCase()}`; // e.g. LX-4F7K2Q9A
    try {
      // Paystack sends the customer back to this address after paying
      const callbackUrl = `${new URL(request.url).origin}/api/checkout/verify`;
      const payment = await initializeTransaction({
        email: user.email,
        amountNgn,
        reference: orderNumber, // one payment per order, so the order number is the reference
        callbackUrl,
      });

      await Order.create({
        orderNumber,
        user: userId,
        items: lines.map(({ product, size, quantity }) => ({
          product: product._id,
          slug: product.slug,
          name: product.name,
          subtitle: product.subtitle,
          image: product.images[0],
          size,
          quantity,
          unitPriceUsd: product.price,
        })),
        shippingAddress: { ...address, country: "Nigeria" },
        subtotalUsd,
        shippingUsd,
        totalUsd,
        currency: "NGN",
        exchangeRate,
        amountNgn,
        status: "pending",
        payment: { provider: "paystack", reference: orderNumber, authorizationUrl: payment.authorization_url },
      });

      return Response.json({ orderNumber, authorizationUrl: payment.authorization_url }, { status: 201 });
    } catch (error) {
      await restoreStock(reserved); // give the stock back
      console.error("Could not start the payment:", error);
      return Response.json({ message: "Could not start the payment. Please try again." }, { status: 502 });
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}