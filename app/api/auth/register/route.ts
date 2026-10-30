import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { User } from "@/models/User";

// POST /api/auth/register
export async function POST(request: Request) {
  // 1. Read the JSON the form sent
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }

  // 2. Validate on the server with the SAME rules as the form
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Please check the form", errors: z.flattenError(result.error).fieldErrors },
      { status: 400 }
    );
  }
  const { firstName, lastName, dateOfBirth, email, password } = result.data;

  try {
    await connectDB();

    // 3. Stop if this email already has an account
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return Response.json(
        { message: "An account with this email already exists" },
        { status: 409 } // 409 = conflict
      );
    }

    // 4. Hash the password (12 = how hard it is to crack; higher = slower but safer)
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Save the new user
    const user = await User.create({
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      email,
      passwordHash,
    });

    // 6. Log them in straight away (sets the secure cookie)
    await createSession(user._id.toString());

    // 7. Send back the user WITHOUT the password hash
    return Response.json(
      {
        message: "Account created",
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { status: 201 } // 201 = created
    );
  } catch (error) {
    console.error("Register error:", error); // full details in the terminal only
    return Response.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}