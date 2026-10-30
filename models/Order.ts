import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// One line of the order. It copies the name, image and price at the moment of purchase,
// so the order never changes if the product is edited or deleted later.
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceUsd: { type: Number, required: true, min: 0 }, // price per item in USD, from the database
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, required: true, default: "Nigeria" },
  },
  { _id: false }
);

export const ORDER_STATUSES = ["pending", "paid", "failed", "shipped", "delivered", "cancelled"] as const;

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. "LX-4F7K2Q"
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },

    // Money. Prices are stored in USD (like the products), and what the customer
    // is actually charged is stored in naira with the rate we used.
    subtotalUsd: { type: Number, required: true, min: 0 },
    shippingUsd: { type: Number, required: true, min: 0, default: 0 },
    totalUsd: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "NGN" },
    exchangeRate: { type: Number, required: true }, // 1 USD = this many naira
    amountNgn: { type: Number, required: true, min: 0 }, // whole naira charged

    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
    payment: {
      provider: { type: String, default: "paystack" },
      reference: { type: String, unique: true, sparse: true }, // set when the payment starts
      authorizationUrl: { type: String }, // the Paystack payment page, so an unpaid order can be paid later
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const Order = (models.Order as Model<OrderDoc>) || model<OrderDoc>("Order", orderSchema);