# Netlify environment variables

Netlify is the only service the site needs at runtime — hosting, Functions
and storage all come from it. Set these under **Site configuration →
Environment variables**, scoped to *All scopes* (build + functions), since
the mail code runs inside Functions rather than at build time.

`NODE_VERSION` is already pinned to 22 in `netlify.toml`, so it doesn't need
adding here.

## Required — 4 keys

| Key | Value | Where it comes from |
|---|---|---|
| `ADMIN_PASSWORD` | *(you choose)* | First-run password for `/admin`. Change it from inside the dashboard afterwards — the stored hash then takes over. Min 8 chars. |
| `RESEND_API_KEY` | *(secret)* | resend.com → API Keys. **Use a freshly rotated key** — the previous one was shared in chat and should be revoked. |
| `MAIL_FROM` | `Gauldentrap <noreply@gauldentrap.com>` | Sender on transactional mail. The domain must be verified in Resend. |
| `MAIL_OWNER` | `support@gauldentrap.com` | Fallback for where order/contact/signup alerts land. |

`MAIL_REPLY_TO` is optional and defaults to the same address.

> Both mail addresses are **fallbacks only** — whatever is saved under
> Admin → Settings → Notifications wins at runtime, so they can be changed
> later without a redeploy.

## Storage — nothing to set

Orders, subscribers, site settings and admin auth live in **Netlify Blobs**,
which is provisioned automatically for the site. No account, no keys, no SQL
to run. Admin-uploaded product images go to a `product-images` blob store and
are served through `/api/uploads/<name>`.

Locally (no `NETLIFY` env var) it falls back to JSON files under `data/`, so
`npm run dev` needs no setup at all.

## Optional

| Key | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_IMAGE_CDN` | `https://cdn.jsdelivr.net/gh/batahrisco/gauldentrap@main/public` | Serves the ~208MB of imagery from jsDelivr instead of Netlify's bandwidth. Needs the repo public and pushed. Leave unset to serve from the site — the cache headers already make repeat visits ~free. |

## SMTP fallback — only if you drop Resend

Netlify Functions run on Lambda, which blocks or hangs outbound SMTP. The
code tries Resend first and only falls back to SMTP, so leave these unset
unless Resend becomes unavailable.

| Key | Value |
|---|---|
| `SMTP_HOST` | `mail.spacemail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | `support@gauldentrap.com` |
| `SMTP_PASS` | *(mailbox password)* |

## Before going live

1. Set the four required variables above.
2. Verify `gauldentrap.com` as a **sending domain** in Resend and add the
   DKIM/SPF records it gives you. Send-only — it does **not** touch MX, so
   Spacemail keeps receiving mail at `support@`.
3. Deploy, then sign in at `/admin` and set the payment methods, messenger
   handles and notification address.

## Deploying without GitHub

```bash
npx netlify-cli deploy --prod
```

Uploads the build straight from this folder. Netlify dedupes unchanged files,
so only what actually changed goes up on later deploys. Connect the repo
whenever you want auto-deploy on push instead.
