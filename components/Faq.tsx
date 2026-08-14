"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How fast is shipping?",
    a: "Orders placed before 2pm ship the same day. Tracked worldwide delivery typically arrives in 5–12 business days depending on your country, and shipping is free on orders over $100.",
  },
  {
    q: "Are your products genuine?",
    a: "Yes — everything we stock is sourced direct and verified genuine. If a product line offers authenticity codes, you can verify yours on the manufacturer's site.",
  },
  {
    q: "Is the packaging discreet?",
    a: "Always. Orders arrive in plain packaging with no branding and no mention of the contents on the outside.",
  },
  {
    // Deliberately not a hardcoded list — the real one is whatever the owner
    // has switched on in the admin panel, shown in the footer and at checkout.
    q: "What payment methods do you accept?",
    a: "Bank transfer, card, the major wallets and crypto — including Bitcoin and USDT. The full list of what we currently accept is shown in the footer and at checkout.",
  },
  {
    q: "What is your returns policy?",
    a: "Unopened products can be returned within 30 days for a full refund. Faulty items are replaced free — just email support@gauldentrap.com with your order number.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-1.5">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className={`overflow-hidden rounded-xl border transition-colors ${
              isOpen ? "border-accent" : "border-line"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 bg-surface px-5 py-4 text-left text-sm font-semibold transition hover:bg-surface-2"
            >
              {f.q}
              <span
                className={`shrink-0 text-xl leading-none text-accent transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="bg-surface px-5 pb-4 text-[13.5px] leading-relaxed text-muted">
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
