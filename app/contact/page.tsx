import type { Metadata } from "next";
import { getSettings, telegramUrl, whatsappUrl } from "@/lib/settings";
import ContactLinks from "@/components/ContactLinks";
import ContactForm from "@/components/ContactForm";
import PaymentBadges from "@/components/PaymentBadges";
import Medallion from "@/components/Medallion";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the Gauldentrap team by email, WhatsApp, Telegram or live chat. Order questions, wholesale enquiries and support.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const wa = whatsappUrl(settings.whatsapp);
  const tg = telegramUrl(settings.telegram);

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-12">
      <div className="flex items-center gap-4">
        <Medallion variant={1} size={44} className="shrink-0" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            Get in touch
          </p>
          <h1 className="font-display text-4xl">CONTACT US</h1>
          <div className="dot-row mt-2" aria-hidden />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="font-display text-2xl">Send us a message</h2>
          <p className="mt-1.5 text-sm text-muted">
            We answer every message — usually within a few hours during
            business days.
          </p>
          <div className="mt-5">
            <ContactForm />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
              Talk to us now
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Live chat sits bottom-right of every page. For anything else:
            </p>

            <div className="mt-4 space-y-2.5">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-line-2 px-4 py-3 text-sm font-semibold transition hover:border-[#25D366] hover:bg-[#25D366]/10"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white">
                    ✆
                  </span>
                  WhatsApp us
                </a>
              )}
              {tg && (
                <a
                  href={tg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-line-2 px-4 py-3 text-sm font-semibold transition hover:border-[#29A9EB] hover:bg-[#29A9EB]/10"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#29A9EB] text-white">
                    ➤
                  </span>
                  Message on Telegram
                </a>
              )}
              <a
                href="mailto:support@gauldentrap.com"
                className="flex items-center gap-3 rounded-lg border border-line-2 px-4 py-3 text-sm font-semibold transition hover:border-accent hover:bg-accent/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-ink">
                  @
                </span>
                support@gauldentrap.com
              </a>
            </div>

            {/* Every channel the owner has switched on, messengers included */}
            <ContactLinks settings={settings} className="mt-5" />
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
              We accept
            </h2>
            <PaymentBadges settings={settings} className="mt-4" />
            <p className="mt-4 text-xs leading-relaxed text-muted/80">
              All prices in USD. Shipping worldwide in discreet, unbranded
              packaging. 18+ only.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
