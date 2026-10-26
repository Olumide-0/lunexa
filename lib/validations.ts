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
// Backend phase: switch this back to a simple "required" check and let the
// server verify the password, so older accounts can still log in.
export const loginSchema = z.object({
  email: emailRule,
  password: strongPassword,
});

/* ---------- TypeScript types, created from the schemas ---------- */
export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;

/* ---------- Helper: turn react-hook-form errors into { field: message } for logging ---------- */
export function getErrorMessages(errors: FieldErrors) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, error]) => [field, error?.message])
  );
}