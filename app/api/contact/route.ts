import { NextResponse } from "next/server";
import {
  contactCustomerHtml,
  contactOwnerHtml,
  ownerAddress,
  replyToAddress,
  sendMail,
  type ContactMessage,
} from "@/lib/email";
import { getSettings } from "@/lib/settings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 120, subject: 160, message: 4000, channel: 120 };

export async function POST(req: Request) {
  try {
    return await handleContact(req);
  } catch (e) {
    const msg = String((e as Error)?.stack ?? (e as Error)?.message ?? e);
    console.error("[contact] unhandled:", msg);
    return NextResponse.json(
      { error: "server_error", detail: msg.slice(0, 500) },
      { status: 500 }
    );
  }
}

async function handleContact(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<ContactMessage> | null;
  if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  const m: ContactMessage = {
    name: clip(body.name, MAX.name),
    email: clip(body.email, MAX.subject),
    subject: clip(body.subject, MAX.subject) || "Contact form",
    message: clip(body.message, MAX.message),
    channel: clip(body.channel, MAX.channel) || undefined,
  };

  if (!m.name || !m.message) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(m.email)) {
    return NextResponse.json({ error: "bad_email" }, { status: 400 });
  }

  const settings = await getSettings();

  // Awaited, not fire-and-forget: serverless freezes the function once the
  // response is sent. sendMail is capped and never throws.
  const [owner] = await Promise.allSettled([
    sendMail({
      to: ownerAddress(settings),
      subject: `Contact — ${m.subject}`,
      html: contactOwnerHtml(m),
      // reply goes straight back to whoever wrote in
      replyTo: m.email,
    }),
    sendMail({
      to: m.email,
      subject: "We got your message — Gauldentrap",
      html: contactCustomerHtml(m),
      replyTo: replyToAddress(settings),
    }),
  ]);

  // The customer ack is a nicety; the owner copy is the message itself. If
  // that one didn't go out, say so rather than showing a false "sent".
  const delivered = owner.status === "fulfilled" && owner.value === true;
  if (!delivered) {
    return NextResponse.json({ error: "mail_unavailable" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
