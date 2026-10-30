import { deleteSession } from "@/lib/auth";

// POST /api/auth/logout
export async function POST() {
  await deleteSession();
  return Response.json({ message: "Logged out" });
}