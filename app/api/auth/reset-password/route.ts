import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { resetPasswordRequestSchema } from "@/lib/validations";
import { User } from "@/models/User";

// POST /api/auth/reset-password
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }

  const result = resetPasswordRequestSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Please check the form", errors: z.flattenError(result.error).fieldErrors },
      { status: 400 }
    );
  }
  const { token, password } = result.data;

  try {
    await connectDB();

    // Scramble the token from the link the same way, then look for a match that hasn't expired
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() }, // $gt = "greater than" now, i.e. still valid
    });

    if (!user) {
      return Response.json(
        { message: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Save the new password hash and delete the token so the link can't be used again
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log them in straight away
    await createSession(user._id.toString());

    return Response.json({
      message: "Password updated",
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}