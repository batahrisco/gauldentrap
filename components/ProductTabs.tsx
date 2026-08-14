"use client";

import { useState } from "react";
import type { ProductFaq, ProductReview } from "@/lib/product";

type Tab = "desc" | "shipping" | "faqs" | "reviews";

function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="tracking-[1px] text-[#fbbf24]" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
    </span>
  );
}

/**
 * The reference product page's four-tab block: Description, Shipping, FAQs
 * and Reviews. Shipping copy is the same for every product, so it lives here
 * rather than being repeated 924 times in the catalog.
 */
export default function ProductTabs({
  description,
  faqs = [],
  reviews = [],
  isNicotine,
}: {
  description: string;
  faqs?: ProductFaq[];
  reviews?: ProductReview[];
  isNicotine: boolean;
}) {
  const [tab, setTab] = useState<Tab>("desc");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tabs: { key: Tab; label: string; hidden?: boolean }[] = [
    { key: "desc", label: "Description" },
    { key: "shipping", label: "Shipping" },
    { key: "faqs", label: "FAQs", hidden: faqs.length === 0 },
    {
      key: "reviews",
      label: `Reviews${reviews.length ? ` (${reviews.length})` : ""}`,
      hidden: reviews.length === 0,
    },
  ];

  const avg = reviews.length
    ? Math.round((reviews.reduce((n, r) => n + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div className="mt-14 rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap gap-1 border-b border-line px-3 pt-3">
        {tabs
          .filter((t) => !t.hidden)
          .map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-t-lg px-4 py-2.5 text-[13px] font-bold transition ${
                tab === t.key
                  ? "bg-background text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      <div className="p-6">
        {tab === "desc" && (
          <p className="text-sm leading-[1.85] text-muted">
            {description || "No description available for this product."}
          </p>
        )}

        {tab === "shipping" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["📦 Packaging", "Triple vacuum-sealed inside a plain outer box or padded envelope. No branding, no product references, nothing on the outside."],
              ["🚚 Dispatch", "Within 1 business day of payment confirmation. Crypto orders usually dispatch same-day once payment confirms."],
              ["⏳ Delivery", "3–7 business days for most destinations. Tracking is emailed as soon as your parcel leaves us."],
              ["💸 Cost", "Free shipping on every order. No handling fees, no surprises at checkout."],
            ].map(([h, b]) => (
              <div key={h} className="rounded-lg border border-line-2 bg-surface-2 p-4">
                <p className="text-[13px] font-bold">{h}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{b}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "faqs" && (
          <div className="flex flex-col gap-1.5">
            {faqs.map((f, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-lg border transition-colors ${
                  openFaq === i ? "border-accent" : "border-line-2"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 bg-surface-2 px-5 py-4 text-left text-sm font-semibold"
                >
                  {f.q}
                  <span className="shrink-0 text-accent">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 pt-3 text-[13.5px] leading-relaxed text-muted">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div>
            <div className="flex flex-wrap items-center gap-5 rounded-lg border border-line-2 bg-surface-2 px-5 py-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl leading-none">{avg.toFixed(1)}</span>
                <span className="text-sm text-muted">out of 5</span>
              </div>
              <div>
                <Stars n={Math.round(avg)} />
                <p className="mt-1 text-xs text-muted">
                  Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {reviews.map((r, i) => (
                <figure key={i} className="rounded-lg border border-line-2 bg-surface-2 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-ink">
                      {r.name.trim()[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <figcaption className="truncate text-sm font-semibold">{r.name}</figcaption>
                      <Stars n={r.rating} />
                    </div>
                  </div>
                  <blockquote className="mt-3 text-[13px] leading-[1.8] text-muted">
                    {r.text}
                  </blockquote>
                  {r.date && <p className="mt-2.5 text-[10.5px] text-muted/60">{r.date}</p>}
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="border-t border-line px-6 py-4 text-[11.5px] leading-relaxed text-muted/80">
        {isNicotine
          ? "18+ only. Contains nicotine, an addictive chemical. Not for use by non-smokers, or by people who are pregnant or breastfeeding."
          : "21+ only where required. Keep out of reach of children and pets. Intoxicating effects may be delayed — do not drive or operate machinery after use."}
      </p>
    </div>
  );
}
