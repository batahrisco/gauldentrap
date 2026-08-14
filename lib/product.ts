/**
 * Product types and pure helpers — no filesystem access, so client
 * components can import these without dragging node:fs into the browser
 * bundle (Turbopack hard-fails the build if they do).
 *
 * lib/catalog.ts re-exports everything here, so server code can keep
 * importing from one place.
 */

export type CatalogImage = {
  src: string;
  alt: string;
};

/** Weight/size options (flower, hash, concentrates). Empty for fixed-price items. */
export type Variant = {
  label: string;
  price: number;
};

export type ProductReview = {
  name: string;
  rating: number;
  text: string;
  date?: string;
};

export type ProductFaq = { q: string; a: string };

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  /** Set only when the product has variants — the cheapest option */
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
  group: GroupKey;
  /** Finer bucket inside the group, e.g. "THCa Flower" under Flower */
  category: string;
  strain: string | null;
  grade: string | null;
  featured: boolean;
  brand: string | null;
  images: CatalogImage[];
  variants: Variant[];
  /** Ported per-product reviews/FAQs (713 of the 924 carry them) */
  reviews?: ProductReview[];
  faqs?: ProductFaq[];
  /** ISO date — set for owner-added products (drives "newest first") */
  createdAt?: string;
  isCustom?: boolean;
};

/**
 * Shop nav groups, in menu order. The first nine are Meridian's own ranges;
 * the last three carry the nicotine lines brought over from the Aussie
 * catalog and are deliberately kept separate from the cannabis "Vapes"
 * range — different product, different customer, different law.
 */
/** `tile` is the category-card backdrop — the same art the reference build
 *  used, not a product shot, so the grid reads as designed rather than as a
 *  second product row. */
export const GROUPS = [
  { key: "flower", label: "Flower", icon: "🌿", tile: "/hero_images/beleafla/hero_367.webp" },
  { key: "edibles", label: "Edibles", icon: "🍬", tile: "/hero_images/hyperwolf/hero_001.png" },
  { key: "vapes", label: "Vapes", icon: "💨", tile: "/hero_images/hyperwolf/hero_030.png" },
  { key: "concentrates", label: "Concentrates", icon: "💎", tile: "/hero_images/hyperwolf/hero_078.png" },
  { key: "hash", label: "Hash", icon: "🍯", tile: "/hero_images/hyperwolf/hero_081.png" },
  { key: "prerolls", label: "Pre-Rolls", icon: "🚬", tile: "/hero_images/hyperwolf/hero_002.png" },
  { key: "shrooms", label: "Shrooms", icon: "🍄", tile: "/hero_images/shrooms.webp" },
  { key: "cbd", label: "CBD", icon: "🧴", tile: "/hero_images/cbd.webp" },
  { key: "wholesale", label: "Wholesale", icon: "📦", tile: "/hero_images/beleafla/hero_583.webp" },
  // no reference art for the nicotine ranges — these fall back to a product shot
  { key: "disposables", label: "Disposable Vapes", icon: "🔋", tile: "" },
  { key: "pods", label: "Pods", icon: "🧩", tile: "" },
  { key: "pouches", label: "Nicotine Pouches", icon: "⚪", tile: "" },
] as const;

export function groupTile(key: string): string {
  return GROUPS.find((g) => g.key === key)?.tile ?? "";
}

export type GroupKey = (typeof GROUPS)[number]["key"];

/** The three nicotine ranges — used to show the right compliance copy. */
export const NICOTINE_GROUPS: GroupKey[] = ["disposables", "pods", "pouches"];

export function isNicotineGroup(key: string): boolean {
  return (NICOTINE_GROUPS as string[]).includes(key);
}

export function groupLabel(key: string): string {
  return GROUPS.find((g) => g.key === key)?.label ?? "Other";
}

export function groupIcon(key: string): string {
  return GROUPS.find((g) => g.key === key)?.icon ?? "•";
}

export function primaryImage(p: Product): CatalogImage | undefined {
  return p.images[0];
}

/** Lowest price a product can be bought at — variants price from their cheapest. */
export function priceFrom(p: Product): number {
  return p.priceMin ?? p.price ?? 0;
}

export function hasRange(p: Product): boolean {
  return p.priceMax != null && p.priceMax !== priceFrom(p);
}

/** Deterministic per product id, so pages stay stable between renders. */
export function popularity(p: Product): number {
  return (
    (p.featured ? 100 : 0) +
    (p.isCustom ? 50 : 0) +
    ((p.id * 2654435761) % 97) / 97
  );
}

export const sellable = (p: Product) =>
  p.inStock && p.images.length > 0 && priceFrom(p) > 0;
