import crypto from "crypto";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";
import { User } from "@/models/User";

const ONE_HOUR = 60 * 60 * 1000; // in milliseconds

// POST /api/auth/forgot-password
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }

  const result = forgotPasswordSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Please check the form", errors: z.flattenError(result.error).fieldErrors },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: result.data.email.toLowerCase() });

    if (user) {
      // 1. A long random one-time token (this goes in the email link)
      const token = crypto.randomBytes(32).toString("hex");

      // 2. Save only a SCRAMBLED copy + expiry time on the user
      user.resetPasswordTokenHash = crypto.createHash("sha256").update(token).digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + ONE_HOUR);
      await user.save();

      // 3. The link opens the homepage, and the auth modal shows the "new password" view
      const resetLink = `${process.env.APP_URL}/?reset=${token}`;
      if (process.env.NODE_ENV !== "production") {
        console.log("🔑 Password reset link (development only):", resetLink);
      }
      await sendPasswordResetEmail(user.email, user.firstName, resetLink);
    }

    // Same answer whether the email exists or not (don't reveal who has an account)
    return Response.json({
      message: "If an account exists for that email, we've sent a link to reset your password.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}