import { getSessionUserId } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

// GET /api/auth/me
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ user: null }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return Response.json({ user: null }, { status: 401 }); // account deleted

    return Response.json({
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return Response.json({ user: null }, { status: 500 });
  }
}