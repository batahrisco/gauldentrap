import Link from "next/link";
import { getSettings } from "@/lib/settings";
import ContactLinks from "@/components/ContactLinks";
import PaymentBadges from "@/components/PaymentBadges";

const SHOP_LINKS = [
  { href: "/shop", label: "All products" },
  { href: "/shop?group=flower", label: "Flower" },
  { href: "/shop?group=edibles", label: "Edibles" },
  { href: "/shop?group=vapes", label: "Vapes" },
  { href: "/shop?group=disposables", label: "Disposable vapes" },
  { href: "/shop?group=pouches", label: "Nicotine pouches" },
];

const HELP_LINKS = [
  { href: "/contact", label: "Contact us" },
  { href: "/shipping", label: "Shipping & delivery" },
  { href: "/returns", label: "Returns & refunds" },
  { href: "/faq", label: "FAQ" },
  { href: "/track", label: "Track my order" },
];

const LEGAL_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/legal", label: "Legal & compliance" },
];

export default async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="mt-20 border-t border-line bg-surface text-muted">
      {/* Gold hairline marking the page/footer seam */}
      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(90deg,transparent,var(--accent) 30%,var(--accent) 70%,transparent)",
          opacity: 0.5,
        }}
        aria-hidden
      />
      <div className="mx-auto grid max-w-[1380px] gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <p className="font-display text-2xl text-accent">GAULDENTRAP</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            900+ premium products — flower, edibles, vapes, concentrates,
            disposables and nicotine pouches. Lab tested, discreetly shipped,
            30-day guarantee.
          </p>
          <a
            href="mailto:support@gauldentrap.com"
            className="mt-4 inline-flex items-center gap-2 text-sm text-foreground transition hover:text-accent"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            support@gauldentrap.com
          </a>
          {/* Both messengers plus socials, regardless of which one floats */}
          <ContactLinks settings={settings} className="mt-5" />
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SHOP_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">Help</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {HELP_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">
            Company
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">
            We accept
          </p>
          {/* Mirrors the checkout buttons exactly — both read the same toggles */}
          <PaymentBadges settings={settings} className="mt-4" />
          <p className="mt-5 text-xs leading-relaxed text-muted/80">
            18+ only. Nicotine is an addictive chemical. By entering this site
            you confirm you are of legal age where you live. All prices in USD.
          </p>
        </div>
      </div>

      <div className="border-t border-line px-4 py-4 text-center text-xs text-muted/70">
        © {new Date().getFullYear()} Gauldentrap · gauldentrap.com
      </div>
    </footer>
  );
}
