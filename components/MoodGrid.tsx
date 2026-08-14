"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/product";

export type MoodKey =
  | "sleep"
  | "euphoria"
  | "focus"
  | "energy"
  | "relax"
  | "appetite";

export const MOODS: { key: MoodKey; icon: string; label: string }[] = [
  { key: "sleep", icon: "😴", label: "Sleep" },
  { key: "euphoria", icon: "😊", label: "Euphoria" },
  { key: "focus", icon: "🎯", label: "Focus" },
  { key: "energy", icon: "⚡", label: "Energy" },
  { key: "relax", icon: "😌", label: "Relax" },
  { key: "appetite", icon: "🍯", label: "Appetite" },
];

/**
 * "Shop by Effect" — pills swap the grid beneath them without a page load,
 * exactly as on the reference homepage. Buckets are picked server-side.
 */
export default function MoodGrid({
  buckets,
}: {
  buckets: Record<MoodKey, Product[]>;
}) {
  const [active, setActive] = useState<MoodKey>("sleep");
  const items = buckets[active] ?? [];

  return (
    <>
      <div className="mb-9 flex flex-wrap gap-2.5">
        {MOODS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActive(m.key)}
            className={`flex items-center gap-[7px] rounded-full border px-5 py-[9px] text-[12.5px] font-medium transition ${
              active === m.key
                ? "border-accent bg-accent/10 text-accent shadow-[0_0_12px_var(--dim)]"
                : "border-line-2 bg-surface-2 text-muted hover:border-accent hover:text-accent"
            }`}
          >
            <span>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
