# Gauldentrap

Storefront for **gauldentrap.com** — Meridian Kush's catalog and design,
rebuilt on a dynamic stack, with three nicotine ranges added.

Next.js 16 (App Router, Turbopack) · Tailwind v4 · Supabase · Resend · Netlify.

## Catalog — 924 products

| Range | Count | Source |
|---|---:|---|
| Flower | 222 | Meridian |
| Edibles | 209 | Meridian |
| Disposable Vapes | 167 | Aussie |
| Vapes | 113 | Meridian |
| CBD | 53 | Meridian |
| Pre-Rolls | 44 | Meridian |
| Concentrates | 33 | Meridian |
| Hash | 31 | Meridian |
| Shrooms | 23 | Meridian |
| Wholesale | 18 | Meridian |
| Pods | 7 | Aussie |
| Nicotine Pouches | 4 | Aussie |

The 746 Meridian products were extracted from the static export
(`product/*.html` ld+json, `IMAGES`/`WEIGHTS` vars, joined with the
`shop/*.html` category index). 285 of them carry weight variants (3.5g/7g/
14g/28g), priced per option. The 178 nicotine products came from the Aussie
catalog, converted once from AUD to USD at 0.65.

Everything ships prebuilt in `catalog/products.json` (836KB); imagery in
`public/images` (Meridian), `public/products` + `public/sourced` (nicotine).

## Owner-controlled settings (`/admin/settings`)

Live-editable, no redeploy needed.

| Setting | Effect |
|---|---|
| Payment methods | Each ticked method shows its badge in the footer **and** becomes a checkout option. Bank wire, card, PayPal, Apple/Google Pay, Bitcoin, USDT, Ethereum, plus a custom "other". |
| Checkout mode | `manual` (customer picks a method, you email details) or `direct` (your saved details show at checkout). |
| WhatsApp / Telegram | Both always appear in the footer and on `/contact`. |
| Floating button | Which messenger floats bottom-left. Tawk.to always holds bottom-right, so only one messenger fits there. |
| Livechat embed | Paste the Tawk.to snippet; the embed URL is extracted from it. |
| Notification email | Where order/contact/signup alerts go. Overrides `MAIL_OWNER`, so a dead mailbox is routed around instantly. |
| Reply-to | The address customers see on transactional mail. |
| Social links | A filled URL shows that icon; empty hides it. |

## Local development

```bash
npm install
cp .env.example .env.local   # fill in ADMIN_PASSWORD at minimum
npm run dev
```

Without `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`, storage falls back to
the JSON files in `data/` — fine locally, not for production (Netlify
functions have a read-only filesystem).

## Deploy (Netlify)

1. Push to `github.com/batahrisco/gauldentrap`, connect the repo in Netlify.
   `netlify.toml` sets the build command and the Next.js runtime plugin.
2. Run `supabase/schema.sql` once in the Supabase SQL editor
   (project `vkbhgbhjkaidgujlkhog`) — one `store` table, RLS on, no public
   policies.
3. Set the environment variables from `.env.example` in Netlify.
4. Verify `gauldentrap.com` as a sending domain in Resend and add its
   DKIM/SPF records. **Send-only — it does not touch MX**, so Spacemail keeps
   handling inbound mail for `support@`.

## Notes

- **Prices are stored and charged in USD.** Variant products price per
  option; the server re-prices every line from the catalog at checkout, so a
  posted price or an unknown variant label can't be trusted or charged.
- **`lib/reviews.ts` ships empty on purpose.** Publishing invented
  testimonials breaches the FTC fake-review rule. The homepage hides the
  whole section while the array is empty.
- **`lib/product.ts` vs `lib/catalog.ts`** — types and pure helpers live in
  `product.ts` with no `node:fs` import, so client components can use them.
  `catalog.ts` does the filesystem reads and re-exports everything.
  Importing `catalog.ts` from a `"use client"` file fails the build.
- **`content/pages.json`** holds the eight ported policy pages with their
  original inline styles; `globals.css` aliases the reference build's CSS
  variable names (`--bg`, `--ac`, `--tx`…) so that markup renders unchanged.
- Anything read via `readFileSync(process.cwd() + …)` must be listed in
  `outputFileTracingIncludes` in `next.config.ts`, or it reads as empty in
  production.

## Not yet ported

- **Multi-currency switcher.** Meridian displayed USD/GBP/CAD/AUD/NZD/EUR
  from a client-side rate table. Prices here are USD only.
- **Per-product reviews and FAQs.** Present in Meridian's product pages;
  deliberately left out pending real review data.
