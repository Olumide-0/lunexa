import { z } from "zod";

// Flat shipping fee in USD. 0 = free shipping. Change it when you decide your delivery pricing.
export const SHIPPING_FEE_USD = 0;

// The address form. The page checks it in the browser, and the API checks it again on the server.
export const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,16}$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your state").max(80),
  postalCode: z.string().trim().max(20).optional(),
});

// What the browser sends to POST /api/checkout. Only ids, sizes and quantities,
// NEVER prices: the server looks the prices up itself.
export const checkoutSchema = shippingSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product"),
        size: z.string().trim().min(1).max(20),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Your bag is empty")
    .max(50),
});

export type ShippingInput = z.infer<typeof shippingSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;