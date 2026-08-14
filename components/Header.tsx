"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

// Primary nav mirrors the reference build; the rest lives under "More".
const PRIMARY = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/shop?group=flower", label: "Flower", icon: "🌿" },
  { href: "/shop?group=edibles", label: "Edibles", icon: "🍬" },
  { href: "/shop?group=vapes", label: "Vapes", icon: "💨" },
  { href: "/shop?group=concentrates", label: "Concentrates", icon: "💎" },
  { href: "/shop?group=hash", label: "Hash", icon: "🍯" },
  { href: "/shop?group=prerolls", label: "Pre-Rolls", icon: "🚬" },
];

const MEGA = [
  { href: "/shop?group=shrooms", label: "Shrooms", icon: "🍄", sub: "Microdose & more" },
  { href: "/shop?group=cbd", label: "CBD", icon: "🧴", sub: "Tinctures, topicals" },
  { href: "/shop?group=wholesale", label: "Wholesale", icon: "📦", sub: "Bulk pricing" },
  { href: "/shop?group=disposables", label: "Disposable Vapes", icon: "🔋", sub: "Rechargeable & 10k+" },
  { href: "/shop?group=pods", label: "Pods", icon: "🧩", sub: "Replacement pods" },
  { href: "/shop?group=pouches", label: "Nicotine Pouches", icon: "⚪", sub: "Snus & pouches" },
];

const TICKER = [
  "Free Shipping on Orders Over $199",
  "Discreet Plain Packaging",
  "Triple Vacuum Sealed",
  "New Customers: 10% Off Code WELCOME10",
  "Third-Party Lab Tested",
  "30-Day Replacement Guarantee",
  "Secure Encrypted Checkout",
];

export default function Header() {
  const { count } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  // Click-away for the mega menu
  useEffect(() => {
    if (!megaOpen) return;
    const onDown = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [megaOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setMobileOpen(false);
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement ticker */}
      <div className="announce overflow-hidden py-[7px] text-xs font-semibold tracking-wide">
        <div className="ticker-row">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>
              <span className="mr-2">✦</span>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-line bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1380px] items-center gap-4 px-4 lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-auto drop-shadow-[0_0_10px_var(--glow)]"
              priority
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[20px] tracking-[0.15em] text-accent">
                GAULDENTRAP
              </span>
              <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-verify">
                Premium Dispensary
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex">
            {PRIMARY.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md px-[11px] py-1.5 text-[12px] font-medium uppercase tracking-wider text-muted transition hover:bg-accent/10 hover:text-accent"
              >
                {item.label}
              </Link>
            ))}

            <div className="relative" ref={megaRef}>
              <button
                onClick={() => setMegaOpen((o) => !o)}
                aria-expanded={megaOpen}
                className="flex items-center gap-1 rounded-md px-[11px] py-1.5 text-[12px] font-medium uppercase tracking-wider text-muted transition hover:bg-accent/10 hover:text-accent"
              >
                More
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                className={`absolute left-1/2 top-[calc(100%+10px)] z-50 grid min-w-[460px] -translate-x-1/2 grid-cols-2 gap-1 rounded-[14px] border border-line-2 bg-surface p-3.5 shadow-[0_20px_60px_rgba(0,0,0,.9)] transition ${
                  megaOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1.5 opacity-0"
                }`}
              >
                {MEGA.map((m) => (
                  <Link
                    key={m.label}
                    href={m.href}
                    onClick={() => setMegaOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-[9px] text-[12.5px] font-medium text-muted transition hover:bg-surface-2 hover:text-accent"
                  >
                    <span className="text-base">{m.icon}</span>
                    <span className="flex flex-col leading-tight">
                      {m.label}
                      <span className="text-[10px] text-muted/60">{m.sub}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 sm:block">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search 900+ products…"
                className="w-full rounded-lg border border-line bg-surface-2 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent"
              />
              <svg
                viewBox="0 0 24 24" width="15" height="15"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.8-3.8" />
              </svg>
            </div>
          </form>

          <Link
            href="/cart"
            className="glow-accent flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[13px] font-bold text-ink transition hover:bg-accent-2"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.6L5 3H2" />
              <circle cx="9.5" cy="20.5" r="1.5" />
              <circle cx="17.5" cy="20.5" r="1.5" />
            </svg>
            Cart
            {count > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black/40 px-1 text-[11px] font-extrabold">
                {count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex flex-col gap-[5px] p-2 xl:hidden"
            aria-label="Menu"
          >
            <span className={`block h-0.5 w-[22px] rounded bg-muted transition ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-0.5 w-[22px] rounded bg-muted transition ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-[22px] rounded bg-muted transition ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>

        {mobileOpen && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-line bg-background px-4 pb-4 xl:hidden">
            <form onSubmit={submitSearch} className="pt-3 sm:hidden">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </form>
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="block border-b border-line py-3 text-sm font-semibold text-accent"
            >
              Shop All
            </Link>
            {[...PRIMARY.slice(1), ...MEGA].map((m) => (
              <Link
                key={m.label}
                href={m.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 border-b border-line py-3 text-sm font-medium text-muted transition hover:text-accent"
              >
                <span>{m.icon}</span>
                {m.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm font-medium text-muted transition hover:text-accent"
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
