import Link from "next/link";
import type { Metadata } from "next";
import {
  getBrandsForGroup,
  getCategoriesForGroup,
  getGroupCounts,
  getStrainsForGroup,
  groupLabel,
  searchProducts,
  type GroupKey,
} from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = { title: "Shop" };

const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  { key: "name", label: "A–Z" },
] as const;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Rebuilds the current query string with one key changed (and page reset). */
function withParam(sp: SP, key: string, value: string | null): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const s = one(v);
    if (s && k !== "page" && k !== key) q.set(k, s);
  }
  if (value) q.set(key, value);
  const s = q.toString();
  return s ? `/shop?${s}` : "/shop";
}

const pill = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition ${
    on
      ? "border-accent bg-accent/10 text-accent"
      : "border-line-2 bg-surface-2 text-muted hover:border-accent hover:text-accent"
  }`;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const group = (one(sp.group) as GroupKey | undefined) ?? undefined;
  const category = one(sp.category);
  const brand = one(sp.brand);
  const strain = one(sp.strain);
  const q = one(sp.q);
  const sort = (one(sp.sort) as "featured" | "price-asc" | "price-desc" | "name") ?? "featured";
  const page = Number(one(sp.page) ?? 1) || 1;

  const [{ items, total, pages }, groups, categories, strains, brands] =
    await Promise.all([
      searchProducts({ q, group, category, brand, strain, sort, page }),
      getGroupCounts(),
      getCategoriesForGroup(group ?? null),
      getStrainsForGroup(group),
      getBrandsForGroup(group),
    ]);

  const heading = q
    ? `Results for “${q}”`
    : group
      ? groupLabel(group)
      : "All products";

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          Shop
        </p>
        <h1 className="font-display text-4xl tracking-[0.04em]">{heading}</h1>
        <div className="dot-row mt-2" aria-hidden />
        <p className="mt-2 text-sm text-muted">
          {total} product{total === 1 ? "" : "s"}
        </p>
      </div>

      {/* Group pills */}
      <div className="mt-7 flex flex-wrap gap-2">
        <Link href={withParam(sp, "group", null)} className={pill(!group)}>
          All
        </Link>
        {groups.map((g) => (
          <Link
            key={g.key}
            href={withParam(sp, "group", g.key)}
            className={pill(group === g.key)}
          >
            {g.label}
            <span className="ml-1.5 text-[10.5px] opacity-60">{g.count}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        {/* Facets */}
        <aside className="space-y-6">
          {categories.length > 1 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">
                Category
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={withParam(sp, "category", null)} className={pill(!category)}>
                  All
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={withParam(sp, "category", c.slug)}
                    className={pill(category === c.slug)}
                  >
                    {c.name}
                    <span className="ml-1.5 text-[10.5px] opacity-60">{c.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {strains.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">
                Strain
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={withParam(sp, "strain", null)} className={pill(!strain)}>
                  Any
                </Link>
                {strains.map((s) => (
                  <Link
                    key={s.name}
                    href={withParam(sp, "strain", s.name)}
                    className={pill(strain === s.name)}
                  >
                    {s.name}
                    <span className="ml-1.5 text-[10.5px] opacity-60">{s.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">
                Brand
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={withParam(sp, "brand", null)} className={pill(!brand)}>
                  Any
                </Link>
                {brands.map((b) => (
                  <Link
                    key={b.name}
                    href={withParam(sp, "brand", b.name)}
                    className={pill(brand === b.name)}
                  >
                    {b.name}
                    <span className="ml-1.5 text-[10.5px] opacity-60">{b.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div>
          {/* Sort */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">
              Sort
            </span>
            {SORTS.map((s) => (
              <Link
                key={s.key}
                href={withParam(sp, "sort", s.key)}
                className={pill(sort === s.key)}
              >
                {s.label}
              </Link>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface p-12 text-center">
              <p className="font-display text-2xl">Nothing here</p>
              <p className="mt-2 text-sm text-muted">
                Try a different filter or search term.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-accent-2"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1)
                // window the pager — 39 pages of numbers helps nobody
                .filter(
                  (n) => n === 1 || n === pages || Math.abs(n - page) <= 2
                )
                .map((n, idx, arr) => (
                  <span key={n} className="flex items-center gap-2">
                    {idx > 0 && arr[idx - 1] !== n - 1 && (
                      <span className="text-muted">…</span>
                    )}
                    <Link
                      href={(() => {
                        const qs = new URLSearchParams();
                        for (const [k, v] of Object.entries(sp)) {
                          const s = one(v);
                          if (s && k !== "page") qs.set(k, s);
                        }
                        if (n > 1) qs.set("page", String(n));
                        const s = qs.toString();
                        return s ? `/shop?${s}` : "/shop";
                      })()}
                      className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                        n === page
                          ? "border-accent bg-accent text-ink"
                          : "border-line-2 bg-surface-2 text-muted hover:border-accent hover:text-accent"
                      }`}
                    >
                      {n}
                    </Link>
                  </span>
                ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
