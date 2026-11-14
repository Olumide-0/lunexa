import "server-only";
import { redirect } from "next/navigation";
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

// Use at the top of every admin page.
// Anyone who is not an admin is sent to a page that says the area is for admins only.
// (The admin API routes still answer "Not found", because nobody opens those in a browser.)
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin-only");
  return admin;
}