"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Variant } from "@/lib/product";

type Props = {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  basePrice: number;
  variants: Variant[];
  inStock: boolean;
};

/**
 * Weight/size picker plus add-to-cart. Products with variants have no single
 * price, so the chosen option drives both what's shown and what's charged —
 * the cart line carries the label so the two can't drift apart.
 */
export default function BuyBox({
  id,
  slug,
  name,
  image,
  basePrice,
  variants,
  inStock,
}: Props) {
  const { add } = useCart();
  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variants[selected] ?? null;
  const price = variant ? variant.price : basePrice;

  function handleAdd() {
    add(
      { id, slug, name, image, price, variant: variant?.label ?? null },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div>
      <p className="text-[26px] font-bold">
        {formatPrice(price)}
        {variant && (
          <span className="ml-2 text-sm font-normal text-muted">
            / {variant.label}
          </span>
        )}
      </p>

      {variants.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">
            Size
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <button
                key={v.label}
                type="button"
                onClick={() => setSelected(i)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  i === selected
                    ? "border-accent bg-accent text-ink"
                    : "border-line-2 bg-surface-2 text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {v.label}
                <span className="ml-2 text-[11px] opacity-70">
                  {formatPrice(v.price)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {inStock ? (
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-line-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3.5 py-2.5 text-muted transition hover:text-foreground"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(50, q + 1))}
              className="px-3.5 py-2.5 text-muted transition hover:text-foreground"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="glow-accent flex-1 rounded-lg bg-accent px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-ink transition hover:bg-accent-2"
          >
            {added ? "Added to cart ✓" : "Add to cart"}
          </button>
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-line-2 bg-surface-2 px-4 py-3 text-sm font-semibold text-muted">
          Out of stock — check back soon.
        </p>
      )}
    </div>
  );
}
