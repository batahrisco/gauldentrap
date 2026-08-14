import { NextResponse } from "next/server";
import { storageSelfTest, storeError } from "@/lib/storage";
import { uploadStore } from "@/lib/uploads";
import { getSettings } from "@/lib/settings";
import { ownerAddress, replyToAddress } from "@/lib/email";

// Diagnostics for production issues that can't be reproduced locally
// (missing blob context, read-only filesystem, blocked mail).
//   /api/diag?key=<ADMIN_PASSWORD>          — checks everything, sends nothing
//   /api/diag?key=<ADMIN_PASSWORD>&mail=1   — also sends one test email
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!process.env.ADMIN_PASSWORD || key !== process.env.ADMIN_PASSWORD) {
    return new NextResponse("Not found", { status: 404 });
  }

  const env = {
    NODE_ENV: process.env.NODE_ENV,
    // present during builds, not guaranteed at function runtime — which is
    // exactly why storage no longer keys off it
    NETLIFY: process.env.NETLIFY ?? null,
    NETLIFY_SITE_ID: !!process.env.NETLIFY_SITE_ID,
    NETLIFY_API_TOKEN: !!process.env.NETLIFY_API_TOKEN,
    NETLIFY_BLOBS_CONTEXT: !!process.env.NETLIFY_BLOBS_CONTEXT,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    MAIL_FROM: process.env.MAIL_FROM ?? null,
    MAIL_OWNER: process.env.MAIL_OWNER ?? null,
    SMTP_HOST: process.env.SMTP_HOST ?? null,
  };

  // Round-trips a real write — a read alone silently falls back and lies.
  const storage = await storageSelfTest();
  const blobs = { getStoreError: storeError() };

  let uploads: unknown;
  try {
    const s = await uploadStore();
    uploads = { ok: !!s, store: s ? "netlify-blobs" : "unavailable" };
  } catch (e) {
    uploads = { ok: false, error: String((e as Error)?.message ?? e).slice(0, 250) };
  }

  // Where mail would actually go, after the admin panel overrides
  let mailTargets: unknown;
  try {
    const s = await getSettings();
    mailTargets = { owner: ownerAddress(s), replyTo: replyToAddress(s) };
  } catch (e) {
    mailTargets = { error: String((e as Error)?.message ?? e).slice(0, 200) };
  }

  // Ask Resend directly whether the key is valid and the domain verified
  let resend: unknown = "RESEND_API_KEY not set";
  if (process.env.RESEND_API_KEY) {
    try {
      const r = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(8000),
      });
      const body = (await r.json().catch(() => null)) as {
        data?: { name: string; status: string }[];
        challenge?: unknown;
      } | null;
      resend = {
        status: r.status,
        keyValid: r.status !== 401 && r.status !== 403,
        domains:
          body?.data?.map((d) => ({ name: d.name, status: d.status })) ?? null,
      };
    } catch (e) {
      resend = { ok: false, error: String((e as Error)?.message ?? e).slice(0, 200) };
    }
  }

  // Optional: actually send one, so "it didn't arrive" can be pinned down
  let testMail: unknown = "skipped (add &mail=1 to send)";
  if (url.searchParams.get("mail") === "1") {
    const { sendMail } = await import("@/lib/email");
    const settings = await getSettings().catch(() => null);
    const to = ownerAddress(settings ?? undefined);
    const ok = await sendMail({
      to,
      subject: "Gauldentrap diagnostics test",
      html: "<p>If you're reading this, Resend delivery works.</p>",
    });
    testMail = { to, delivered: ok, note: ok ? undefined : "see function logs for the reason" };
  }

  return NextResponse.json(
    { env, storage, blobs, uploads, mailTargets, resend, testMail },
    { status: 200 }
  );
}
