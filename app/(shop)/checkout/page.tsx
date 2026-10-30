import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout | Lunexa",
  description: "Check out your Lunexa bag.",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}