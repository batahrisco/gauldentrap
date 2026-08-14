"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { groupLabel, hasRange, priceFrom, type Product } from "@/lib/product";

export type HeroSlide = { product: Product; eyebrow: string };

/**
 * Meridian's marquee: the product photo is blurred and darkened to become
 * the slide's own backdrop, with the sharp copy block over it — so a slide
 * works without any separately-art-directed hero imagery.
 */
export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative h-[460px] overflow-hidden border-b border-line bg-background">
      <div
        className="flex h-full transition-transform duration-[900ms] ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map(({ product: p, eyebrow }, i) => {
          const img = p.images[0];
          return (
            <div key={p.id} className="relative h-full w-full shrink-0">
              {img && (
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className="scale-110 object-cover blur-[10px] brightness-[.32] saturate-[.65]"
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg,rgba(4,4,4,.97) 28%,rgba(4,4,4,.55) 65%,rgba(4,4,4,.1) 100%)",
                }}
              />
              <div className="absolute inset-0 mx-auto flex max-w-[1380px] items-center gap-8 px-6 sm:px-12">
                {/* right padding on mobile keeps the copy clear of the
                    pinned product shot */}
                <div className="w-full max-w-[340px] shrink-0 pr-[120px] sm:pr-0">
                  <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                    {eyebrow}
                  </p>
                  <h2 className="font-display mb-3 text-[clamp(34px,4vw,54px)] leading-[0.95] tracking-[0.03em] text-white">
                    {p.name}
                  </h2>
                  <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">
                    {groupLabel(p.group)}
                  </p>
                  <p className="mb-5 text-[22px] font-bold text-[#f0f0f0]">
                    {hasRange(p) && (
                      <span className="mr-1.5 text-xs font-normal text-muted">from</span>
                    )}
                    {formatPrice(priceFrom(p))}
                  </p>
                  <Link
                    href={`/product/${p.slug}`}
                    className="glow-accent inline-flex items-center gap-2.5 rounded-lg bg-accent px-7 py-3 text-[13px] font-extrabold uppercase tracking-[0.08em] text-ink transition hover:bg-accent-2"
                  >
                    Shop now →
                  </Link>
                </div>

                {/* Mobile: pinned to the right edge as a small shot so the
                    slide still shows the product. Desktop: the full panel. */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[130px] items-center justify-center md:pointer-events-auto md:static md:w-auto md:flex-1 md:justify-end md:pr-8">
                  {img && (
                    <Image
                      src={img.src}
                      alt={p.name}
                      width={340}
                      height={340}
                      priority={i === 0}
                      className="glow-img h-[120px] w-[120px] rounded-xl object-cover transition-transform duration-500 md:h-[340px] md:w-[340px] md:rounded-2xl md:hover:-translate-y-1 md:hover:scale-[1.04]"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-[18px] left-1/2 z-10 flex -translate-x-1/2 gap-[7px]">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-[7px] rounded-full transition-all ${
                i === active
                  ? "w-[22px] bg-accent shadow-[0_0_8px_var(--accent)]"
                  : "w-[7px] bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
