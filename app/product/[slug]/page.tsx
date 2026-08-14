import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProducts,
  getRelated,
  groupLabel,
  isNicotineGroup,
  primaryImage,
} from "@/lib/catalog";
import ImageGallery from "@/components/ImageGallery";
import BuyBox from "@/components/BuyBox";
import ProductTabs from "@/components/ProductTabs";
import ProductCard from "@/components/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160) || undefined,
    openGraph: {
      title: product.name,
      images: primaryImage(product) ? [primaryImage(product)!.src] : undefined,
    },
  };
}

const TRUST = [
  { icon: "📦", label: "Discreet packaging" },
  { icon: "🧪", label: "Lab tested" },
  { icon: "🚚", label: "Free shipping" },
  { icon: "↩️", label: "30-day guarantee" },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelated(product, 4);
  const img = primaryImage(product);
  const reviews = product.reviews ?? [];
  const avg = reviews.length
    ? Math.round((reviews.reduce((n, r) => n + r.rating, 0) / reviews.length) * 10) / 10
    : 5;

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-8">
      <nav className="text-xs text-muted">
        <Link href="/" className="transition hover:text-foreground">Home</Link>
        {" › "}
        <Link href={`/shop?group=${product.group}`} className="transition hover:text-foreground">
          {groupLabel(product.group)}
        </Link>
        {" › "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-10 md:grid-cols-2">
        <ImageGallery images={product.images} name={product.name} />

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            {product.category || groupLabel(product.group)}
          </p>
          <h1 className="font-display mt-1.5 text-[clamp(26px,3.5vw,40px)] leading-tight tracking-[0.03em]">
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-[13px]">
            <span className="tracking-[1px] text-[#fbbf24]">
              {"★".repeat(Math.round(avg))}
            </span>
            <span className="text-muted">
              {reviews.length ? `${avg.toFixed(1)} · ${reviews.length} reviews` : "New arrival"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {product.strain && (
              <span className="rounded-full border border-line-2 bg-surface-2 px-3 py-1 text-[11px] font-semibold text-muted">
                {product.strain}
              </span>
            )}
            {product.grade && (
              <span className="rounded bg-[#134e4a] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#99f6e4]">
                {product.grade}
              </span>
            )}
            {product.brand && (
              <span className="rounded-full border border-line-2 bg-surface-2 px-3 py-1 text-[11px] font-semibold text-muted">
                {product.brand}
              </span>
            )}
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                product.inStock ? "bg-verify/15 text-verify" : "bg-surface-2 text-muted"
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  product.inStock ? "bg-verify" : "bg-muted"
                }`}
              />
              {product.inStock ? "In stock" : "Out of stock"}
            </span>
          </div>

          <div className="mt-6">
            <BuyBox
              id={product.id}
              slug={product.slug}
              name={product.name}
              image={img?.src ?? null}
              basePrice={product.price}
              variants={product.variants}
              inStock={product.inStock}
            />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRUST.map((t) => (
              <div
                key={t.label}
                className="rounded-lg border border-line bg-surface px-3 py-3 text-center"
              >
                <div className="text-[18px]">{t.icon}</div>
                <p className="mt-1 text-[11px] font-semibold leading-tight text-muted">
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductTabs
        description={product.description}
        faqs={product.faqs}
        reviews={reviews}
        isNicotine={isNicotineGroup(product.group)}
      />

      {related.length > 0 && (
        <section className="mt-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            You Might Also Like
          </p>
          <h2 className="font-display mt-1 text-[clamp(22px,3vw,32px)] tracking-[0.04em]">
            RELATED PRODUCTS
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Bulk CTA — same block the reference product pages close on */}
      <section
        className="mt-14 rounded-xl border border-line px-6 py-10 text-center"
        style={{ background: "linear-gradient(135deg,#111 0%,var(--background) 100%)" }}
      >
        <h2 className="font-display text-[clamp(22px,3vw,32px)] tracking-[0.05em]">
          ORDERING <em className="not-italic text-accent">IN BULK?</em>
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
          Wholesale pricing with volume discounts on this and everything else
          in the catalog. Tell us what you need.
        </p>
        <Link
          href="/contact"
          className="glow-accent mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3 text-[13px] font-extrabold uppercase tracking-wider text-ink transition hover:bg-accent-2"
        >
          Place a Bulk Order →
        </Link>
      </section>
    </div>
  );
}

// 924 products — prerender the catalog so product pages are static
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}
