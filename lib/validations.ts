import { z } from "zod";
import type { FieldErrors } from "react-hook-form";

/* ---------- Shared rules ---------- */
const emailRule = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Enter a valid email address"));

const strongPassword = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[0-9]/, "Password must include at least one number");

/* ---------- Sign up ---------- */
export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine((value) => new Date(value) < new Date(), "Date of birth must be in the past"),
  email: emailRule,
  password: strongPassword,
});

/* ---------- Log in ---------- */
// Only "required" here: the SERVER checks if the password is correct.
export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Password is required"),
});

/* ---------- Forgot password (email only) ---------- */
export const forgotPasswordSchema = z.object({
  email: emailRule,
});

/* ---------- Reset password form (new password typed twice) ---------- */
export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // show the error under the confirm box
  });

/* ---------- What the reset form sends to the server ---------- */
export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1, "This reset link is invalid"),
  password: strongPassword,
});

/* ---------- TypeScript types, created from the schemas ---------- */
export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/* ---------- Helper: turn react-hook-form errors into { field: message } for logging ---------- */
export function getErrorMessages(errors: FieldErrors) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, error]) => [field, error?.message])
  );
}