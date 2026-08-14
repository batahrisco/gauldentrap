# Netlify environment variables

Set these under **Site configuration → Environment variables**. Scope them to
*All scopes* (build + functions) — the mail and storage code runs inside
Netlify Functions, not just at build time.

`NODE_VERSION` is already pinned to 22 in `netlify.toml`, so it does not need
adding here.

## Required

| Key | Value | Where it comes from |
|---|---|---|
| `ADMIN_PASSWORD` | *(you choose)* | First-run password for `/admin`. Change it from inside the dashboard afterwards — the stored hash then takes over. Min 8 chars. |
| `SUPABASE_URL` | `https://vkbhgbhjkaidgujlkhog.supabase.co` | Your project. Already known. |
| `SUPABASE_SERVICE_ROLE_KEY` | *(secret)* | Supabase → Project Settings → API Keys → `service_role`. **Server-only — never expose this to the browser.** |
| `RESEND_API_KEY` | *(secret)* | resend.com → API Keys. **Use a freshly rotated key** — the previous one was shared in chat and must be revoked. |
| `MAIL_FROM` | `Gauldentrap <noreply@gauldentrap.com>` | Sender shown on transactional mail. The domain must be verified in Resend. |
| `MAIL_REPLY_TO` | `support@gauldentrap.com` | Reply-to shown to customers. |
| `MAIL_OWNER` | `support@gauldentrap.com` | Where order/contact/signup alerts land. |

> `MAIL_REPLY_TO` and `MAIL_OWNER` are **fallbacks only** — whatever is saved
> under Admin → Settings → Notifications wins at runtime, so the address can be
> changed later without a redeploy.

## Optional

| Key | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_IMAGE_CDN` | `https://cdn.jsdelivr.net/gh/batahrisco/gauldentrap@main/public` | Serves the ~208MB of product imagery from jsDelivr instead of Netlify's bandwidth. Only works once the repo is public and pushed. Leave unset to serve from the site. |

## SMTP fallback (only if you drop Resend)

Now that Spacemail is back up you *could* send over SMTP instead — but
Netlify Functions run on Lambda, which blocks or hangs outbound SMTP. The code
tries Resend first and only falls back to SMTP, so leave these unset unless
Resend is unavailable.

| Key | Value |
|---|---|
| `SMTP_HOST` | `mail.spacemail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | `support@gauldentrap.com` |
| `SMTP_PASS` | *(mailbox password)* |

## Before the first deploy

1. Run `supabase/schema.sql` once in the Supabase SQL editor — it creates the
   single `store` table with RLS on and no public policies.
2. Verify `gauldentrap.com` as a **sending domain** in Resend and add the
   DKIM/SPF records it gives you. This is send-only and does **not** touch the
   MX records, so Spacemail keeps receiving mail at `support@`.
3. Deploy, then sign in at `/admin` and set the payment methods, messenger
   handles and notification address.
