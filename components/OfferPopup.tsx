"use client";

import { useEffect, useRef, useState } from "react";
import {
  AGE_OK_KEY,
  DISCOUNT_STORAGE_KEY,
  OFFER_DONE_KEY,
  WELCOME_CODE,
} from "@/lib/discount";

const CHANNELS = ["Email", "Telegram", "Phone / WhatsApp"] as const;

/**
 * First-order offer popup — appears 10s after the age gate is cleared, once
 * per visitor. Takes a name and whichever channel the visitor prefers, so
 * people who'd never hand over an email still convert; the code is stored
 * locally either way and checkout applies it automatically.
 */
export default function OfferPopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (localStorage.getItem(OFFER_DONE_KEY)) return;
    if (localStorage.getItem(DISCOUNT_STORAGE_KEY)) return;

    const arm = () => timers.current.push(setTimeout(() => setOpen(true), 10_000));
    // already past the gate on this visit
    if (localStorage.getItem(AGE_OK_KEY) === "1") arm();
    else window.addEventListener("age-confirmed", arm, { once: true });

    return () => {
      window.removeEventListener("age-confirmed", arm);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(OFFER_DONE_KEY, "1");
    setOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      setError("Please add your name and how to reach you.");
      return;
    }
    setError("");
    setState("busy");

    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
    try {
      if (looksLikeEmail) {
        await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: contact.trim() }),
        });
      } else {
        // Telegram handle / phone number — no mailbox to send to, so this
        // reaches the owner as a contact message instead.
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: "no-email@gauldentrap.com",
            subject: "First-order discount request",
            channel: channel || "Not specified",
            message: `Wants the first-order discount code. Reach them on ${channel || "their preferred channel"}: ${contact.trim()}`,
          }),
        });
      }
    } catch {
      // the code is granted regardless — capture is best-effort
    }

    localStorage.setItem(DISCOUNT_STORAGE_KEY, WELCOME_CODE);
    localStorage.setItem(OFFER_DONE_KEY, "1");
    setState("done");
    timers.current.push(setTimeout(() => setOpen(false), 4000));
  }

  if (!open) return null;

  const input =
    "w-full rounded-lg border border-line-2 bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="dot-field relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-line-2 bg-surface p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-foreground"
        >
          ✕
        </button>

        {state === "done" ? (
          <>
            <div className="text-[40px]">🎉</div>
            <h2 className="font-display mt-2 text-3xl tracking-[0.04em]">YOU&apos;RE IN!</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Your discount code{" "}
              <b className="text-accent">{WELCOME_CODE}</b> is locked in — it
              applies automatically at checkout.
            </p>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">
              🎁 First Order Offer
            </span>
            <h2 className="font-display mt-4 text-[clamp(26px,5vw,34px)] leading-[1.05] tracking-[0.04em]">
              UP TO <span className="text-accent">10% OFF</span>
              <br />
              YOUR FIRST ORDER
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Drop your name and preferred contact below. We&apos;ll send your
              exclusive discount code straight to you — no hassle.
            </p>

            <form onSubmit={submit} className="mt-5 flex flex-col gap-2.5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or nickname"
                autoComplete="off"
                className={input}
              />
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className={input}
              >
                <option value="">How should we reach you?</option>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Your email / Telegram / number"
                autoComplete="off"
                className={input}
              />
              {error && (
                <p className="text-[12.5px] font-semibold text-accent">{error}</p>
              )}
              <button
                disabled={state === "busy"}
                className="glow-accent mt-1 rounded-lg bg-accent px-5 py-3.5 text-[13px] font-extrabold uppercase tracking-wider text-ink transition hover:bg-accent-2 disabled:opacity-60"
              >
                {state === "busy" ? "Sending…" : "Send My Discount →"}
              </button>
              <p className="text-[11px] text-muted/70">
                We respect your privacy. No spam, ever.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
