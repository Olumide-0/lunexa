import { Resend } from "resend";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";
import { User } from "@/models/User";

// Where the logo is loaded from. Email apps can only load images from a public https address,
// so the logo shows after you deploy (it will not load while testing on localhost).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lunexa-coral.vercel.app";
const LOGO_URL = `${SITE_URL}/email-logo.png`;

// Names are typed by users, so make them safe before putting them into HTML
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// One layout for every Lunexa email, so they all look like the store.
// Emails must use inline styles and tables: email apps ignore Tailwind and most modern CSS.
function emailLayout({ preheader, content }: { preheader: string; content: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
  </head>
  <body style="margin:0;padding:0;background:#F2F2F2;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F2F2F2;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F2F2;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:4px;">
            <tr>
              <td align="center" style="padding:32px 32px 24px;border-bottom:1px solid #E5E5E5;">
                <a href="${SITE_URL}" style="text-decoration:none;">
                  <img src="${LOGO_URL}" alt="Lunexa" width="120" style="display:block;width:120px;height:auto;border:0;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#000000;">
                ${content}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 32px 28px;border-top:1px solid #E5E5E5;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6B6B6B;">
                <a href="${SITE_URL}" style="color:#000000;font-weight:bold;text-decoration:none;">LUNEXA</a><br />
                Premium sportswear for women and men.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// A black button, like the buttons in the store
function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background:#000000;border-radius:4px;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

// Sends the "reset your password" email.
// Without RESEND_API_KEY it just skips sending (the link is still printed in the terminal in development).
export async function sendPasswordResetEmail(to: string, firstName: string, resetLink: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing from .env.local, so the email was not sent");
    return;
  }

  const resend = new Resend(apiKey);

  const html = emailLayout({
    preheader: "Choose a new password for your Lunexa account.",
    content: `
      <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:28px;font-weight:bold;text-transform:uppercase;color:#000000;">Reset your password</h1>
      <p style="margin:0 0 12px;">Hi ${escapeHtml(firstName)},</p>
      <p style="margin:0;">We got a request to reset your Lunexa password. Click the button below to choose a new one. This link works once and expires in 1 hour.</p>
      ${emailButton(resetLink, "Reset password")}
      <p style="margin:0 0 8px;font-size:13px;line-height:20px;color:#6B6B6B;">Button not working? Copy this link into your browser:</p>
      <p style="margin:0 0 24px;font-size:12px;line-height:18px;word-break:break-all;"><a href="${resetLink}" style="color:#000000;">${resetLink}</a></p>
      <p style="margin:0;font-size:13px;line-height:20px;color:#6B6B6B;">Didn't ask for this? You can ignore this email. Your password won't change.</p>
    `,
  });

  const text = `Hi ${firstName},\n\nWe got a request to reset your Lunexa password. Open this link to choose a new one (it works once and expires in 1 hour):\n\n${resetLink}\n\nDidn't ask for this? You can ignore this email. Your password won't change.\n\nLunexa`;

  const { error } = await resend.emails.send({
    // Test mode: onboarding@resend.dev can only send to YOUR Resend signup email.
    // After verifying your own domain, change this to e.g. "Lunexa <no-reply@lunexa.com>".
    from: "Lunexa <onboarding@resend.dev>",
    to,
    subject: "Reset your Lunexa password",
    html,
    text,
  });

  if (error) console.error("Email error:", error);
}

/* ---------- Order confirmation ---------- */

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

// Email apps need a full web address for images, and Gmail does not show WebP,
// so Cloudinary pictures are asked for as small JPGs.
function emailImageUrl(src: string): string {
  if (src.startsWith("http")) {
    return src.includes("res.cloudinary.com") ? src.replace("/upload/", "/upload/f_jpg,w_160,c_limit/") : src;
  }
  return `${SITE_URL}${encodeURI(src.startsWith("/") ? src : `/${src}`)}`;
}

type OrderForEmail = OrderDoc & { _id: Types.ObjectId };

// Sends "your order is confirmed" once payment is confirmed.
// It never throws, so a problem with the email can never break the payment flow.
export async function sendOrderConfirmationEmail(orderId: Types.ObjectId | string) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is missing from .env.local, so the order email was not sent");
      return;
    }

    await connectDB();
    const order = await Order.findById(orderId).lean<OrderForEmail | null>();
    if (!order) return;
    const user = await User.findById(order.user).select("email firstName").lean<{ email: string; firstName?: string } | null>();
    if (!user?.email) return;

    const rate = order.exchangeRate;
    const lines = order.items.map((item) => ({
      item,
      total: Math.round(item.unitPriceUsd * item.quantity * rate),
    }));
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    const shipping = Math.max(order.amountNgn - subtotal, 0); // whatever is left of the total, so the numbers always add up
    const address = order.shippingAddress;
    const orderUrl = `${SITE_URL}/orders/${order.orderNumber}`;
    const name = user.firstName || address.fullName;

    const itemRows = lines
      .map(
        ({ item, total }) => `
        <tr>
          <td width="64" style="padding:12px 0;border-bottom:1px solid #F2F2F2;vertical-align:top;">
            <img src="${emailImageUrl(item.image)}" alt="" width="64" height="64" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:4px;background:#F2F2F2;border:0;" />
          </td>
          <td style="padding:12px 12px;border-bottom:1px solid #F2F2F2;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;">
            <strong style="color:#000000;">${escapeHtml(item.name)}</strong><br />
            <span style="color:#6B6B6B;">Size ${escapeHtml(item.size)} · Qty ${item.quantity}</span>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #F2F2F2;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:bold;color:#000000;white-space:nowrap;">
            ${formatNaira(total)}
          </td>
        </tr>`
      )
      .join("");

    const totalRow = (label: string, value: string, strong = false) => `
        <tr>
          <td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:${strong ? 16 : 14}px;line-height:22px;color:${strong ? "#000000" : "#6B6B6B"};${strong ? "font-weight:bold;" : ""}">${label}</td>
          <td align="right" style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:${strong ? 16 : 14}px;line-height:22px;color:#000000;${strong ? "font-weight:bold;" : ""}">${value}</td>
        </tr>`;

    const addressLines = [
      address.fullName,
      address.address,
      [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
      address.country,
      address.phone,
    ]
      .filter(Boolean)
      .map((line) => escapeHtml(String(line)))
      .join("<br />");

    const html = emailLayout({
      preheader: `Order ${order.orderNumber} is confirmed. We received your payment of ${formatNaira(order.amountNgn)}.`,
      content: `
        <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:28px;font-weight:bold;text-transform:uppercase;color:#000000;">Thanks for your order</h1>
        <p style="margin:0 0 12px;">Hi ${escapeHtml(name)},</p>
        <p style="margin:0;">We received your payment of <strong>${formatNaira(order.amountNgn)}</strong>. We'll email you again when your order ships.</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;background:#F2F2F2;border-radius:4px;">
          <tr>
            <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;text-transform:uppercase;color:#6B6B6B;">
              Order number<br />
              <span style="font-size:18px;line-height:26px;font-weight:bold;color:#000000;letter-spacing:0.5px;">${escapeHtml(order.orderNumber)}</span>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
          ${itemRows}
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
          ${totalRow("Subtotal", formatNaira(subtotal))}
          ${totalRow("Shipping", shipping > 0 ? formatNaira(shipping) : "Free")}
          ${totalRow("Total paid", formatNaira(order.amountNgn), true)}
        </table>

        <p style="margin:28px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;font-weight:bold;text-transform:uppercase;color:#6B6B6B;">Delivering to</p>
        <p style="margin:0;font-size:14px;line-height:22px;">${addressLines}</p>

        ${emailButton(orderUrl, "View your order")}
        <p style="margin:0;font-size:13px;line-height:20px;color:#6B6B6B;">Questions about your order? Just reply to this email.</p>
      `,
    });

    const text = [
      `Hi ${name},`,
      ``,
      `We received your payment of ${formatNaira(order.amountNgn)}. Order ${order.orderNumber} is confirmed.`,
      ``,
      ...lines.map(({ item, total }) => `${item.name} (Size ${item.size}) x ${item.quantity}: ${formatNaira(total)}`),
      ``,
      `Subtotal: ${formatNaira(subtotal)}`,
      `Shipping: ${shipping > 0 ? formatNaira(shipping) : "Free"}`,
      `Total paid: ${formatNaira(order.amountNgn)}`,
      ``,
      `View your order: ${orderUrl}`,
      ``,
      `Lunexa`,
    ].join("\n");

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      // Same as the reset email: until your own domain is verified in Resend,
      // this sender can only deliver to your Resend signup email.
      from: "Lunexa <onboarding@resend.dev>",
      to: user.email,
      subject: `Order ${order.orderNumber} confirmed`,
      html,
      text,
    });
    if (error) console.error("Order email error:", error);
  } catch (error) {
    console.error("Order email failed:", error);
  }
}