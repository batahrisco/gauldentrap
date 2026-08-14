"use client";

import { useState } from "react";
import { fieldsFor, GRADES, STRAINS } from "@/lib/product-fields";

const input =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent";

const GROUPS = [
  ["flower", "Flower"],
  ["edibles", "Edibles"],
  ["vapes", "Vapes"],
  ["concentrates", "Concentrates"],
  ["hash", "Hash"],
  ["prerolls", "Pre-Rolls"],
  ["shrooms", "Shrooms"],
  ["cbd", "CBD"],
  ["wholesale", "Wholesale"],
  ["disposables", "Disposable Vapes"],
  ["pods", "Pods"],
  ["pouches", "Nicotine Pouches"],
] as const;

type Variant = { label: string; price: string };

/**
 * The category-dependent half of the product form. Which fields show is
 * driven by what each range actually uses in the catalog — flower carries
 * weights, a strain and a grade; hash/shrooms/concentrates/wholesale carry
 * weights; everything else is a single price.
 */
export default function ProductFields({
  defaultGroup = "flower",
  defaultStrain = "",
  defaultGrade = "",
  defaultVariants = [],
}: {
  defaultGroup?: string;
  defaultStrain?: string | null;
  defaultGrade?: string | null;
  defaultVariants?: { label: string; price: number }[];
}) {
  const [group, setGroup] = useState(defaultGroup);
  const [variants, setVariants] = useState<Variant[]>(
    defaultVariants.map((v) => ({ label: v.label, price: String(v.price) }))
  );
  const f = fieldsFor(group);

  function usePresets() {
    setVariants(f.presets.map((label) => ({ label, price: "" })));
  }

  return (
    <>
      <label className="text-sm">
        <span className="font-semibold">Category *</span>
        <select
          name="group"
          value={group}
          onChange={(e) => {
            setGroup(e.target.value);
            // options from the old category would be meaningless here
            setVariants([]);
          }}
          className={`${input} mt-1.5`}
        >
          {GROUPS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>

      {f.strain && (
        <label className="text-sm">
          <span className="font-semibold">Strain</span>
          <select name="strain" defaultValue={defaultStrain ?? ""} className={`${input} mt-1.5`}>
            <option value="">— none —</option>
            {STRAINS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      )}

      {f.grade && (
        <label className="text-sm">
          <span className="font-semibold">Grade</span>
          <select name="grade" defaultValue={defaultGrade ?? ""} className={`${input} mt-1.5`}>
            <option value="">— none —</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
      )}

      {f.variants && (
        <div className="sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold">Sizes &amp; prices</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={usePresets}
                className="rounded-lg border border-line-2 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
              >
                Use {f.presets.join(" / ")}
              </button>
              <button
                type="button"
                onClick={() => setVariants((v) => [...v, { label: "", price: "" }])}
                className="rounded-lg border border-line-2 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
              >
                + Add size
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Leave empty to sell at a single price. With sizes, the card shows
            &ldquo;from&rdquo; the cheapest and the buyer picks on the product
            page.
          </p>

          <div className="mt-3 space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input
                  name="variantLabel"
                  value={v.label}
                  onChange={(e) =>
                    setVariants((all) =>
                      all.map((x, j) => (j === i ? { ...x, label: e.target.value } : x))
                    )
                  }
                  placeholder="Size, e.g. 3.5g"
                  className={input}
                />
                <input
                  name="variantPrice"
                  value={v.price}
                  onChange={(e) =>
                    setVariants((all) =>
                      all.map((x, j) => (j === i ? { ...x, price: e.target.value } : x))
                    )
                  }
                  placeholder="Price"
                  inputMode="decimal"
                  className={input}
                />
                <button
                  type="button"
                  onClick={() => setVariants((all) => all.filter((_, j) => j !== i))}
                  aria-label="Remove size"
                  className="shrink-0 rounded-lg border border-line-2 px-3 text-muted transition hover:border-accent hover:text-accent"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
