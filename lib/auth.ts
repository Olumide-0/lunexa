import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "lunexa_session";
const SEVEN_DAYS = 60 * 60 * 24 * 7; // in seconds

// The secret that signs tokens, as bytes (what jose expects)
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing from .env.local");
  return new TextEncoder().encode(secret);
}

// Called after a successful login/register: creates a signed token and puts it in a cookie
export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // the token stops working after 7 days
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // browser JavaScript can't read it (protects against stolen logins)
    secure: process.env.NODE_ENV === "production", // HTTPS only on the live site
    sameSite: "lax", // not sent on requests from other websites
    path: "/", // sent with every request to your site
    maxAge: SEVEN_DAYS,
  });
}

// Returns the logged-in user's id, or null if not logged in / token invalid or expired
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null; // tampered or expired
  }
}

// Logout: removes the cookie
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}