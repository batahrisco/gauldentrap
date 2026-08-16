"use client";

import { useState } from "react";
import SpamNote from "@/components/SpamNote";

const input =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent";

const ERRORS: Record<string, string> = {
  missing_fields: "Please fill in your name and message.",
  bad_email: "That email address doesn't look right.",
  mail_unavailable:
    "Our mail service didn't accept the message. Please reach us on WhatsApp or Telegram instead.",
};

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          channel: fd.get("channel"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(ERRORS[data?.error] ?? "Couldn't send that — please try again.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError("Network error — check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-xl border border-verify/40 bg-verify/10 p-6">
        <p className="font-display text-2xl text-verify">Message sent</p>
        <p className="mt-2 text-sm text-muted">
          Thanks — we&apos;ve emailed you a copy and our team will reply
          shortly. Need us faster? Use WhatsApp or Telegram above.
        </p>
        <SpamNote variant="sent" className="mt-4" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-semibold">Your name</span>
          <input name="name" required maxLength={120} className={`${input} mt-1.5`} />
        </label>
        <label className="text-sm">
          <span className="font-semibold">Email</span>
          <input type="email" name="email" required className={`${input} mt-1.5`} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-semibold">Subject</span>
          <input
            name="subject"
            maxLength={160}
            placeholder="Order question, wholesale, something else…"
            className={`${input} mt-1.5`}
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold">Best way to reach you</span>{" "}
          <span className="text-muted">(optional)</span>
          <input
            name="channel"
            maxLength={120}
            placeholder="Email, WhatsApp, Telegram @handle…"
            className={`${input} mt-1.5`}
          />
        </label>
      </div>
      <label className="text-sm">
        <span className="font-semibold">Message</span>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={4000}
          className={`${input} mt-1.5`}
        />
      </label>

      {error && (
        <p className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent">
          {error}
        </p>
      )}

      <button
        disabled={state === "sending"}
        className="glow-accent mt-1 w-full rounded-lg bg-accent px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-ink transition hover:bg-accent-2 disabled:opacity-60 sm:w-auto sm:self-start sm:px-10"
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
