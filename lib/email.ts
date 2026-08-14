import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { PAYMENT_METHOD_LABELS, type SiteSettings } from "@/lib/settings";
import type { Order } from "@/lib/orders";

/**
 * Where owner alerts land. The admin panel wins so a dead mailbox can be
 * routed around without a redeploy (support@ has been down with Spacemail);
 * the env var is the deploy-time fallback.
 */
export function ownerAddress(settings?: SiteSettings): string {
  return (
    settings?.notifyEmail?.trim() ||
    process.env.MAIL_OWNER ||
    "support@gauldentrap.com"
  );
}

export function replyToAddress(settings?: SiteSettings): string {
  return (
    settings?.replyTo?.trim() ||
    process.env.MAIL_REPLY_TO ||
    "support@gauldentrap.com"
  );
}

const FROM = () =>
  process.env.MAIL_FROM || "Gauldentrap <noreply@gauldentrap.com>";

function logEmail(entry: Record<string, unknown>) {
  const line = JSON.stringify({ at: new Date().toISOString(), ...entry });
  // Always emit to stdout — that's what survives on Netlify (function logs)
  console.log("[email]", line);
  try {
    const dir = path.join(process.cwd(), "data");
    mkdirSync(dir, { recursive: true });
    appendFileSync(path.join(dir, "email-log.jsonl"), line + "\n");
  } catch {
    // read-only filesystem in production — stdout log above is enough
  }
}

type MailOpts = { to: string; subject: string; html: string; replyTo?: string };

// Serverless hosts (Netlify functions run on Lambda) block or hang outbound
// SMTP, which killed the whole request — orders returned an empty body and
// the client blew up on res.json(). So: HTTP API first, SMTP only as a
// fallback for hosts that allow it, and a hard cap either way.
const MAIL_TIMEOUT_MS = 5000;

async function sendViaResend(opts: MailOpts): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM(),
      reply_to: opts.replyTo ?? replyToAddress(),
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
    signal: AbortSignal.timeout(MAIL_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return true;
}

async function sendViaSmtp(opts: MailOpts): Promise<boolean> {
  if (!process.env.SMTP_HOST) return false;
  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE ?? "true") !== "false",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // tight, so a blocked port can't hold the function open until it dies
    connectionTimeout: MAIL_TIMEOUT_MS,
    greetingTimeout: MAIL_TIMEOUT_MS,
    socketTimeout: MAIL_TIMEOUT_MS,
  });
  await transporter.sendMail({
    from: FROM(),
    replyTo: opts.replyTo ?? replyToAddress(),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  return true;
}

/**
 * Never throws and never hangs — callers must be able to treat email as
 * best-effort so a mail outage can't lose an order.
 */
export async function sendMail(opts: MailOpts): Promise<boolean> {
  const attempt = async () => {
    if (await sendViaResend(opts)) return "resend";
    if (await sendViaSmtp(opts)) return "smtp";
    return null;
  };
  try {
    const via = await Promise.race([
      attempt(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("mail timeout")), MAIL_TIMEOUT_MS + 1500)
      ),
    ]);
    if (!via) {
      logEmail({ ok: false, to: opts.to, subject: opts.subject, error: "no mail transport configured" });
      return false;
    }
    logEmail({ ok: true, via, to: opts.to, subject: opts.subject });
    return true;
  } catch (e) {
    logEmail({
      ok: false,
      to: opts.to,
      subject: opts.subject,
      error: String((e as Error)?.message ?? e).slice(0, 300),
    });
    return false;
  }
}

/* ── Branded HTML shell ──────────────────────────────────────────────────
   Gold wordmark on a near-black header band, warm off-white body. Kept as
   a light body deliberately: fully dark emails render unpredictably across
   clients that auto-invert. */

const usd = (n: number) => `$${n.toFixed(2)}`;

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0f0f0f;font-family:Arial,Helvetica,sans-serif;color:#241f14;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:24px 12px;"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fdfaf2;border:1px solid #2a2416;border-radius:12px;overflow:hidden;">
      <tr><td style="background:#0b0906;padding:22px 28px;border-bottom:2px solid #f5c542;">
        <span style="font-size:22px;font-weight:800;letter-spacing:3px;color:#f5c542;">GAULDENTRAP</span><br>
        <span style="font-size:11px;color:#8d8578;letter-spacing:3px;">GAULDENTRAP.COM</span>
      </td></tr>
      <tr><td style="padding:8px 28px 26px;">
        <h1 style="font-size:22px;margin:18px 0 14px;color:#241f14;">${title}</h1>
        ${body}
        <p style="font-size:12px;color:#7a7061;margin-top:28px;border-top:1px solid #e6dcc4;padding-top:14px;">
          Questions? Just reply to this email — it reaches our team directly.<br>
          18+ only. Nicotine is an addictive chemical. All prices in USD.
        </p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function itemsTable(order: Order): string {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid #ece3cd;font-size:13.5px;">${esc(i.name)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #ece3cd;font-size:13.5px;text-align:center;">×${i.qty}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #ece3cd;font-size:13.5px;text-align:right;">${usd(i.price * i.qty)}</td>
      </tr>`
    )
    .join("");
  const discountRow = order.discount
    ? `<tr><td colspan="2" style="padding:6px 10px;font-size:13px;color:#1f7a4d;font-weight:700;">10% off (${esc(order.discountCode ?? "")})</td>
       <td style="padding:6px 10px;font-size:13px;color:#1f7a4d;font-weight:700;text-align:right;">−${usd(order.discount)}</td></tr>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6dcc4;border-radius:8px;overflow:hidden;">
    ${rows}
    <tr><td colspan="2" style="padding:8px 10px;font-size:13px;">Subtotal</td>
    <td style="padding:8px 10px;font-size:13px;text-align:right;">${usd(order.subtotal)}</td></tr>
    ${discountRow}
    <tr><td colspan="2" style="padding:10px;font-weight:800;font-size:14px;">Total</td>
    <td style="padding:10px;font-weight:800;font-size:14px;text-align:right;">${usd(order.total ?? order.subtotal)}</td></tr>
  </table>`;
}

function methodLabel(order: Order): string {
  const label =
    PAYMENT_METHOD_LABELS[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] ??
    order.paymentMethod;
  return order.paymentMethod === "other" && order.paymentOther
    ? `Other — ${order.paymentOther}`
    : label;
}

/* ── Order emails ── */

export function orderCustomerHtml(order: Order, settings: SiteSettings): string {
  const payBlock =
    order.paymentMode === "direct"
      ? `<div style="background:#f4ecd8;border-left:3px solid #f5c542;border-radius:8px;padding:14px 16px;margin:16px 0;">
          <p style="margin:0 0 6px;font-size:13.5px;font-weight:800;">Complete your payment — ${methodLabel(order)}</p>
          <p style="margin:0;font-size:13.5px;white-space:pre-line;">${esc(
            settings.payments.methods[
              order.paymentMethod as keyof typeof settings.payments.methods
            ] || "Payment details will follow shortly."
          )}</p>
          <p style="margin:10px 0 0;font-size:12.5px;color:#7a7061;">Use <b>${order.id}</b> as the payment reference. Your order ships once payment clears.</p>
        </div>`
      : `<div style="background:#f4ecd8;border-left:3px solid #f5c542;border-radius:8px;padding:14px 16px;margin:16px 0;">
          <p style="margin:0;font-size:13.5px;">You chose <b>${methodLabel(order)}</b>. Our team will email you shortly with the payment details to complete this order.</p>
        </div>`;

  return shell(
    `Order ${order.id} received 🎉`,
    `<p style="font-size:14px;">Hi ${esc(order.customer.name.split(" ")[0])}, thanks for your order! Here's a summary:</p>
     ${itemsTable(order)}
     ${payBlock}
     <p style="font-size:13.5px;">Delivery to: ${esc(order.customer.address)}, ${esc(order.customer.suburb)} ${esc(order.customer.state)} ${esc(order.customer.postcode)}${order.customer.country ? `, ${esc(order.customer.country)}` : ""}</p>`
  );
}

export function orderOwnerHtml(order: Order): string {
  const c = order.customer;
  return shell(
    `New order ${order.id} — ${usd(order.subtotal)}`,
    `<p style="font-size:14px;"><b>${esc(c.name)}</b> placed an order (${order.paymentMode} mode, method: ${methodLabel(order)}${order.paymentReference ? `, ref: ${esc(order.paymentReference)}` : ""}).</p>
     ${itemsTable(order)}
     <p style="font-size:13.5px;margin-top:14px;">
       <b>Contact:</b> ${esc(c.email)} · ${esc(c.phone)}<br>
       <b>Ship to:</b> ${esc(c.address)}, ${esc(c.suburb)} ${esc(c.state)} ${esc(c.postcode)}${c.country ? `, ${esc(c.country)}` : ""}<br>
       ${c.notes ? `<b>Notes:</b> ${esc(c.notes)}` : ""}
     </p>
     <p style="font-size:13.5px;">${
       order.paymentMode === "manual"
         ? "⚠️ Manual mode: reply to the customer with payment details to proceed."
         : "Direct mode: customer has your payment details; confirm once funds arrive."
     }</p>`
  );
}

/* ── Newsletter emails ── */

export function subscribeCustomerHtml(): string {
  return shell(
    "Your 10% off is inside 🎉",
    `<p style="font-size:14px;">Welcome to Gauldentrap! Use this code at checkout for 10% off your first order:</p>
     <p style="text-align:center;margin:18px 0;"><span style="display:inline-block;background:#0b0906;color:#f5c542;font-weight:800;font-size:18px;letter-spacing:2px;padding:12px 26px;border-radius:8px;border:1px solid #f5c542;">WELCOME10</span></p>
     <p style="font-size:13.5px;">We'll keep you posted on deals, drops and restocks. No spam — unsubscribe anytime by replying to this email.</p>`
  );
}

export function subscribeOwnerHtml(email: string): string {
  return shell(
    "New newsletter signup",
    `<p style="font-size:14px;"><b>${esc(email)}</b> just joined the mailing list from the website.</p>`
  );
}

/* ── Contact form ── */

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Optional preferred reply channel the customer typed (Telegram, WhatsApp…) */
  channel?: string;
};

export function contactOwnerHtml(m: ContactMessage): string {
  return shell(
    `New message — ${esc(m.subject || "Contact form")}`,
    `<p style="font-size:14px;"><b>${esc(m.name)}</b> sent a message from the contact page.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6dcc4;border-radius:8px;overflow:hidden;margin:14px 0;">
       <tr><td style="padding:8px 10px;border-bottom:1px solid #ece3cd;font-size:13px;width:110px;color:#7a7061;">Email</td>
           <td style="padding:8px 10px;border-bottom:1px solid #ece3cd;font-size:13px;">${esc(m.email)}</td></tr>
       ${m.channel ? `<tr><td style="padding:8px 10px;border-bottom:1px solid #ece3cd;font-size:13px;color:#7a7061;">Prefers</td>
           <td style="padding:8px 10px;border-bottom:1px solid #ece3cd;font-size:13px;">${esc(m.channel)}</td></tr>` : ""}
       <tr><td style="padding:8px 10px;font-size:13px;color:#7a7061;vertical-align:top;">Message</td>
           <td style="padding:8px 10px;font-size:13px;white-space:pre-line;">${esc(m.message)}</td></tr>
     </table>
     <p style="font-size:12.5px;color:#7a7061;">Reply straight to this email to answer ${esc(m.name)}.</p>`
  );
}

export function contactCustomerHtml(m: ContactMessage): string {
  return shell(
    "We got your message",
    `<p style="font-size:14px;">Hi ${esc(m.name.split(" ")[0])}, thanks for getting in touch — our team will reply shortly.</p>
     <div style="background:#f4ecd8;border-left:3px solid #f5c542;border-radius:8px;padding:14px 16px;margin:16px 0;">
       <p style="margin:0 0 6px;font-size:12.5px;color:#7a7061;text-transform:uppercase;letter-spacing:1px;">Your message</p>
       <p style="margin:0;font-size:13.5px;white-space:pre-line;">${esc(m.message)}</p>
     </div>
     <p style="font-size:13.5px;">Need us faster? Reach us on WhatsApp or Telegram from the contact page.</p>`
  );
}
