import { readFileSync } from "node:fs";
import path from "node:path";
import { getCustomProducts, slugify, type CustomProduct } from "@/lib/products-custom";
import { imageUrl } from "@/lib/image-host";
import {
  GROUPS,
  groupLabel,
  groupTile,
  isNicotineGroup,
  popularity,
  primaryImage,
  priceFrom,
  sellable,
  type GroupKey,
  type Product,
} from "@/lib/product";

// Re-exported so server code can keep importing everything from one module.
export * from "@/lib/product";

const CATALOG = () => path.join(process.cwd(), "catalog", "products.json");

let cache: Product[] | null = null;

function getBaseProducts(): Product[] {
  if (!cache) {
    let loaded: Product[] = [];
    try {
      loaded = JSON.parse(readFileSync(CATALOG(), "utf8")) as Product[];
    } catch (e) {
      // Never take the storefront down over a catalog read — serve whatever
      // the admin has added instead and log loudly.
      console.error("[catalog] products.json unreadable:", e);
    }
    cache = loaded.map((p) => ({
      ...p,
      images: p.images.map((im) => ({ ...im, src: imageUrl(im.src) })),
    }));
  }
  return cache;
}

/** Owner-added products (admin dashboard) mapped into the catalog shape. */
function customToProduct(c: CustomProduct): Product {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    price: c.price,
    // mirrors the shipped catalog: variants price from the cheapest option
    priceMin: c.variants?.length ? Math.min(...c.variants.map((v) => v.price)) : null,
    priceMax: c.variants?.length ? Math.max(...c.variants.map((v) => v.price)) : null,
    inStock: c.in_stock,
    group: (c.group as GroupKey) ?? "other",
    category: c.categoryName || groupLabel(c.group),
    strain: c.strain ?? null,
    grade: c.grade ?? null,
    featured: false,
    brand: c.brand || null,
    images: c.images.map((im) => ({ src: imageUrl(im.src), alt: im.alt || c.name })),
    variants: c.variants ?? [],
    createdAt: c.createdAt,
    isCustom: true,
  };
}

/**
 * Merged catalog, highest precedence first: admin-created products, then the
 * shipped catalog. An admin product replaces a shipped one with the same slug.
 */
export async function getProducts(): Promise<Product[]> {
  let custom: Product[] = [];
  try {
    custom = (await getCustomProducts()).map(customToProduct);
  } catch (e) {
    console.error("[catalog] custom products unavailable:", e);
  }
  const taken = new Set(custom.map((p) => p.slug));
  const base = getBaseProducts().filter((p) => !taken.has(p.slug));
  return [...custom, ...base];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getGroupCounts(): Promise<
  { key: GroupKey; label: string; count: number }[]
> {
  const counts = new Map<string, number>();
  for (const p of await getProducts()) {
    counts.set(p.group, (counts.get(p.group) ?? 0) + 1);
  }
  return GROUPS.filter((g) => (counts.get(g.key) ?? 0) > 0).map((g) => ({
    key: g.key,
    label: g.label,
    count: counts.get(g.key) ?? 0,
  }));
}

export async function getCategoriesForGroup(
  group: GroupKey | null
): Promise<{ slug: string; name: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const p of await getProducts()) {
    if (group && p.group !== group) continue;
    if (!p.category) continue;
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ slug: slugify(name), name, count }))
    .sort((a, b) => b.count - a.count);
}

/** Strain filter — only meaningful for the cannabis ranges. */
export async function getStrainsForGroup(
  group?: string | null
): Promise<{ name: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const p of await getProducts()) {
    if (group && p.group !== group) continue;
    if (!p.strain) continue;
    counts.set(p.strain, (counts.get(p.strain) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getBrandsForGroup(
  group?: string | null
): Promise<{ name: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const p of await getProducts()) {
    if (group && p.group !== group) continue;
    if (!p.brand) continue;
    counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 14);
}

export type SearchOptions = {
  q?: string;
  group?: string;
  category?: string;
  brand?: string;
  strain?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "name";
  page?: number;
  perPage?: number;
};

export async function searchProducts(opts: SearchOptions): Promise<{
  items: Product[];
  total: number;
  page: number;
  pages: number;
}> {
  const perPage = opts.perPage ?? 24;
  let items = await getProducts();

  if (opts.group) items = items.filter((p) => p.group === opts.group);
  if (opts.category)
    items = items.filter((p) => slugify(p.category) === opts.category);
  if (opts.brand) items = items.filter((p) => p.brand === opts.brand);
  if (opts.strain) items = items.filter((p) => p.strain === opts.strain);
  if (opts.q) {
    const terms = opts.q.toLowerCase().split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const hay = `${p.name} ${p.brand ?? ""} ${p.category} ${p.strain ?? ""}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }

  switch (opts.sort) {
    case "price-asc":
      items = [...items].sort((a, b) => priceFrom(a) - priceFrom(b));
      break;
    case "price-desc":
      items = [...items].sort((a, b) => priceFrom(b) - priceFrom(a));
      break;
    case "name":
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // "featured": flagged first, then in stock, then name
      items = [...items].sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.inStock) - Number(a.inStock) ||
          a.name.localeCompare(b.name)
      );
  }

  // Owner-added products lead on the default sort, newest first
  if (!opts.sort || opts.sort === "featured") {
    const fresh = items
      .filter((p) => p.isCustom)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    if (fresh.length) {
      const ids = new Set(fresh.map((p) => p.id));
      items = [...fresh, ...items.filter((p) => !ids.has(p.id))];
    }
  }

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, opts.page ?? 1), pages);
  return {
    items: items.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    pages,
  };
}

/** Homepage hero — one strong product per group, no group twice in a row. */
export async function getHeroProducts(
  excludeIds: number[] = [],
  limit = 9
): Promise<{ product: Product; eyebrow: string }[]> {
  const excluded = new Set(excludeIds);
  const pool = (await getProducts()).filter(
    (p) => sellable(p) && !excluded.has(p.id)
  );

  const picks: Product[] = [];
  const used = new Set<number>();
  // Round-robin across groups so the marquee shows the range, not one aisle
  for (let round = 0; round < 3 && picks.length < limit; round++) {
    for (const g of GROUPS) {
      if (picks.length >= limit) break;
      const next = pool
        .filter((p) => p.group === g.key && !used.has(p.id))
        .sort((a, b) => popularity(b) - popularity(a))[0];
      if (next) {
        used.add(next.id);
        picks.push(next);
      }
    }
  }

  return picks.map((product, i) => ({
    product,
    eyebrow: HERO_EYEBROWS[i % HERO_EYEBROWS.length],
  }));
}

const HERO_EYEBROWS = [
  "Most Wanted",
  "Top Shelf",
  "Trending Now",
  "Staff Favourite",
  "Fan Favourite",
  "Hot Right Now",
  "Premium Pick",
  "Crowd Pleaser",
  "New Arrival",
];

export async function getCategoryTiles(): Promise<
  { key: GroupKey; label: string; count: number; image: string | null }[]
> {
  const products = await getProducts();
  return (await getGroupCounts()).map((g) => {
    // Reference art first; only the nicotine ranges (no art) fall back to a
    // product shot.
    const art = groupTile(g.key);
    if (art) return { ...g, image: art };
    const rep = products
      .filter((p) => p.group === g.key && sellable(p))
      .sort((a, b) => popularity(b) - popularity(a))[0];
    return { ...g, image: rep ? primaryImage(rep)?.src ?? null : null };
  });
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return [...(await getProducts())]
    .filter(sellable)
    .sort((a, b) => popularity(b) - popularity(a))
    .slice(0, limit);
}

/** The nicotine rail — the ranges brought over from the Aussie catalog. */
export async function getHighDemand(limit = 10): Promise<Product[]> {
  const pool = (await getProducts()).filter(
    (p) => sellable(p) && isNicotineGroup(p.group)
  );
  const byBrand = new Map<string, Product[]>();
  for (const p of pool) {
    const k = p.brand ?? p.name.split(/\s+/)[0];
    if (!byBrand.has(k)) byBrand.set(k, []);
    byBrand.get(k)!.push(p);
  }
  for (const list of byBrand.values()) list.sort((a, b) => popularity(b) - popularity(a));

  // One per brand first so the rail leads with breadth
  const picks: Product[] = [];
  const cursor = new Map<string, number>();
  for (let round = 0; round < limit && picks.length < limit; round++) {
    let added = false;
    for (const [k, list] of byBrand) {
      if (picks.length >= limit) break;
      const i = cursor.get(k) ?? 0;
      if (i < list.length) {
        picks.push(list[i]);
        cursor.set(k, i + 1);
        added = true;
      }
    }
    if (!added) break;
  }
  return picks.slice(0, limit);
}

/**
 * "Shop by Effect" buckets — six products per mood. The reference build
 * hand-picked these; here they're derived from strain and range, which is
 * how budtenders actually make the same call.
 */
export async function getMoodBuckets(
  perMood = 6
): Promise<Record<string, Product[]>> {
  const pool = (await getProducts()).filter(sellable);
  const RULES: Record<string, (p: Product) => boolean> = {
    sleep: (p) => p.strain === "Indica" || p.group === "hash",
    euphoria: (p) => p.strain === "Hybrid" || p.group === "concentrates",
    focus: (p) => p.strain === "Sativa" || p.group === "cbd",
    energy: (p) => p.strain === "Sativa" || p.group === "prerolls",
    relax: (p) => p.strain === "Indica" || p.group === "cbd",
    appetite: (p) => p.group === "edibles",
  };

  const out: Record<string, Product[]> = {};
  for (const [mood, match] of Object.entries(RULES)) {
    const picks = pool.filter(match).sort((a, b) => popularity(b) - popularity(a));
    // rotate per mood so the six aren't the same top sellers every time
    const offset = (mood.length * 7) % Math.max(1, picks.length);
    out[mood] = [...picks.slice(offset), ...picks.slice(0, offset)].slice(0, perMood);
  }
  return out;
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const same = (await getProducts()).filter(
    (p) =>
      p.id !== product.id &&
      p.inStock &&
      p.images.length > 0 &&
      (p.category === product.category || p.group === product.group)
  );
  const offset = same.length ? product.id % same.length : 0;
  return [...same.slice(offset), ...same.slice(0, offset)].slice(0, limit);
}
