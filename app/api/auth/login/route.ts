import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import { User } from "@/models/User";

// POST /api/auth/login
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Please check the form", errors: z.flattenError(result.error).fieldErrors },
      { status: 400 }
    );
  }
  const { email, password } = result.data;

  try {
    await connectDB();

    // passwordHash has select: false in the model, so we ask for it on purpose here
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    // Compare the typed password with the saved hash
    const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;

    // Same message whether the email or the password is wrong,
    // so attackers can't find out which emails have accounts
    if (!user || !passwordOk) {
      return Response.json({ message: "Incorrect email or password" }, { status: 401 });
    }

    await createSession(user._id.toString());

    return Response.json({
      message: "Logged in",
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}