import Link from "next/link";
import Image from "next/image";
import {
  getBestSellers,
  getCategoryTiles,
  getGroupCounts,
  getHeroProducts,
  getMoodBuckets,
} from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import Faq from "@/components/Faq";
import NewsletterForm from "@/components/NewsletterForm";
import Reviews from "@/components/Reviews";
import MoodGrid, { type MoodKey } from "@/components/MoodGrid";
import { REVIEWS } from "@/lib/reviews";

/* Section order mirrors the reference homepage exactly:
   hero → categories → top shelf → trust → about → reviews → mood →
   bulk → faq → newsletter. */

const TRUST = [
  {
    icon: "📦",
    title: "Discreet Packaging",
    body: "Triple vacuum sealed. Plain box — nothing visible outside.",
  },
  {
    icon: "🧪",
    title: "Lab Tested",
    body: "Third-party tested for potency, purity and pesticides.",
  },
  {
    icon: "🔒",
    title: "Secure Checkout",
    body: "256-bit SSL encryption. Your data is never shared.",
  },
  {
    icon: "↩️",
    title: "30-Day Guarantee",
    body: "Damaged or incorrect? We make it right within 30 days.",
  },
];

function SectionHead({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </p>
        <h2 className="font-display text-[clamp(26px,3.5vw,40px)] tracking-[0.04em]">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-[12px] font-semibold uppercase tracking-wider text-muted transition hover:text-accent"
        >
          {linkLabel ?? "View all"} →
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const hero = await getHeroProducts();
  const topShelf = await getBestSellers(8);
  const tiles = await getCategoryTiles();
  const groups = await getGroupCounts();
  const moods = (await getMoodBuckets()) as Record<MoodKey, Awaited<ReturnType<typeof getBestSellers>>>;
  const total = groups.reduce((n, g) => n + g.count, 0);

  const STATS = [
    { icon: "🚚", value: "2,000,000+", label: "Deliveries Completed Worldwide" },
    { icon: "🏆", value: `${total}+`, label: "Premium Products" },
    { icon: "🌍", value: "6", label: "Countries Served" },
    { icon: "🛡️", value: "30", label: "Day Guarantee" },
  ];

  return (
    <>
      <HeroSlider slides={hero} />

      {/* ── Browse by category ── */}
      <section className="mx-auto max-w-[1380px] px-6 py-16">
        <SectionHead
          eyebrow="Browse by Category"
          title="WHAT ARE YOU LOOKING FOR?"
          href="/shop"
          linkLabel="Shop all"
        />
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <Link
              key={t.key}
              href={`/shop?group=${t.key}`}
              className="group relative block aspect-[3/2] overflow-hidden rounded-[10px] border border-line transition hover:-translate-y-[3px] hover:border-accent hover:shadow-[0_8px_32px_var(--glow)]"
            >
              {t.image && (
                // Sharp and near-full brightness — the art is the point. Only
                // the gradient below keeps the label readable.
                <Image
                  src={t.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  style={{ filter: "brightness(0.95)" }}
                />
              )}
              {/* Confined to the lower third so it darkens only the caption */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5">
                <div>
                  <p className="font-display text-[20px] tracking-[0.06em] text-white">
                    {t.label}
                  </p>
                  <p className="mt-px text-[10px] text-white/40">{t.count} products</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Top shelf this week ── */}
      <section className="mx-auto max-w-[1380px] px-6 pb-16">
        <SectionHead
          eyebrow="Hand Picked"
          title="TOP SHELF THIS WEEK"
          href="/shop"
        />
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-4">
          {topShelf.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── Trust bar + stats ── */}
      <section className="border-y border-line bg-surface px-6 py-9">
        <div className="mx-auto grid max-w-[1380px] gap-5 text-center sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title}>
              <div className="mb-2.5 text-[26px]">{t.icon}</div>
              <p className="text-[13.5px] font-bold text-[#5eead4]">{t.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{t.body}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-9 grid max-w-[1380px] gap-5 border-t border-line pt-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="mb-1.5 text-[22px]">{s.icon}</div>
              <p className="font-display text-[30px] leading-none text-accent">{s.value}</p>
              <p className="mt-1.5 text-[11px] uppercase tracking-wider text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section className="border-b border-line bg-background">
        <div className="mx-auto grid max-w-[1380px] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 lg:pr-14">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              Who We Are
            </p>
            <h2 className="font-display text-[clamp(30px,4vw,50px)] leading-[1.05] tracking-[0.04em]">
              Premium Cannabis.
              <br />
              <em className="not-italic text-accent">No Compromise.</em>
            </h2>
            <p className="mt-4.5 text-sm leading-[1.85] text-muted">
              Gauldentrap sources only the finest cannabis from trusted
              cultivators — craft flower, premium concentrates, artisanal
              edibles and more. Every product is third-party lab tested before
              it reaches you.
            </p>
            <p className="mt-3 text-sm leading-[1.85] text-muted">
              Every order ships triple vacuum-sealed in completely plain,
              unmarked packaging. Nothing on the outside gives any indication
              of what is inside.
            </p>
            <Link
              href="/about"
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg border border-accent px-8 py-3 text-[13px] font-bold uppercase tracking-wider text-accent transition hover:bg-accent hover:text-ink"
            >
              Our Story →
            </Link>
          </div>
          <div className="relative min-h-[340px] overflow-hidden">
            {/* same shot the reference build runs beside "Our Story" */}
            <Image
              src="/hero_images/cannabuddy/hero_1133.webp"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover brightness-[.65]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      {REVIEWS.length > 0 && (
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-[1380px] px-6 py-16">
            <SectionHead eyebrow="Customer Reviews" title="WHAT PEOPLE ARE SAYING" />
            <Reviews />
          </div>
        </section>
      )}

      {/* ── Shop by effect (pills swap the grid in place) ── */}
      <section className="border-b border-line bg-surface px-6 py-16">
        <div className="mx-auto max-w-[1380px]">
          <SectionHead eyebrow="Shop by Effect" title="HOW DO YOU WANT TO FEEL?" />
          <MoodGrid buckets={moods} />
        </div>
      </section>

      {/* ── Bulk / wholesale ── */}
      <section
        className="border-b border-line px-6 py-16 text-center"
        style={{ background: "linear-gradient(135deg,#111 0%,var(--background) 100%)" }}
      >
        <div className="mx-auto max-w-[620px]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            Wholesale &amp; Bulk
          </p>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] tracking-[0.05em]">
            ORDERING <em className="not-italic text-accent">IN BULK?</em>
          </h2>
          <p className="mt-2.5 text-sm leading-[1.8] text-muted">
            Looking to place a large order for your business, collective, or
            personal stockpile? We offer wholesale pricing with volume
            discounts. Reach out and let us work something out.
          </p>
          <Link
            href="/contact"
            className="glow-accent mt-7 inline-flex items-center gap-2.5 rounded-lg bg-accent px-9 py-3.5 text-sm font-extrabold uppercase tracking-wider text-ink transition hover:bg-accent-2"
          >
            Place a Bulk Order →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-b border-line px-6 py-[72px]">
        <div className="mx-auto max-w-[820px]">
          <SectionHead eyebrow="Common Questions" title="FREQUENTLY ASKED" />
          <Faq />
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="dot-field bg-surface px-6 py-16 text-center">
        <div className="mx-auto max-w-[720px]">
          <h2 className="font-display text-[clamp(26px,3.5vw,40px)] leading-tight tracking-[0.04em]">
            GET <em className="not-italic text-accent">10% OFF</em> YOUR FIRST ORDER
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Drop your email for exclusive deals, restocks and member-only
            discounts. No spam.
          </p>
          <div className="mt-7">
            <NewsletterForm />
          </div>
          <p className="mt-4 text-[11px] text-muted/70">
            By subscribing you confirm you are 21+ and agree to our{" "}
            <Link href="/terms" className="text-accent hover:underline">Terms</Link> &amp;{" "}
            <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
