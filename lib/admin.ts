import "server-only";
import { notFound } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

// ADMIN_EMAILS in .env.local, e.g. ADMIN_EMAILS=you@example.com,partner@example.com
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export type Admin = { id: string; email: string };

// The signed-in admin, or null for everyone else (signed out, normal customers, no ADMIN_EMAILS set)
export async function getAdmin(): Promise<Admin | null> {
  const allowed = adminEmails();
  if (allowed.length === 0) return null;

  const userId = await getSessionUserId();
  if (!userId) return null;

  await connectDB();
  const user = await User.findById(userId).select("email").lean<{ email: string } | null>();
  if (!user || !allowed.includes(user.email.toLowerCase())) return null;

  return { id: String(userId), email: user.email };
}

// Use at the top of every admin page and admin API route.
// Anyone who is not an admin gets the normal 404 page, so /admin looks like it doesn't exist.
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) notFound();
  return admin;
}