import { redirect } from "next/navigation";

// The mega menu's "Leggings" links point here, so send them to the All Leggings page
export default function LeggingsPage() {
  redirect("/women/all-leggings");
}