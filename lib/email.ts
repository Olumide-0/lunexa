import { Resend } from "resend";

// Sends the "reset your password" email.
// Without RESEND_API_KEY it just skips sending (the link is still printed in the terminal in development).
export async function sendPasswordResetEmail(to: string, firstName: string, resetLink: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing from .env.local, so the email was not sent");
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    // Test mode: onboarding@resend.dev can only send to YOUR Resend signup email.
    // After verifying your own domain, change this to e.g. "Lunexa <no-reply@lunexa.com>".
    from: "Lunexa <onboarding@resend.dev>",
    to,
    subject: "Reset your Lunexa password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h1 style="font-size: 20px; text-transform: uppercase;">Reset your password</h1>
        <p>Hi ${firstName},</p>
        <p>We got a request to reset your Lunexa password. Click the button below to choose a new one.
        This link works once and expires in 1 hour.</p>
        <p style="margin: 32px 0;">
          <a href="${resetLink}" style="background: #000; color: #fff; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: bold;">
            Reset password
          </a>
        </p>
        <p style="color: #6B6B6B; font-size: 13px;">Didn't ask for this? You can ignore this email; your password won't change.</p>
      </div>
    `,
  });

  if (error) console.error("Email error:", error);
}