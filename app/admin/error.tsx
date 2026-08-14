"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Admin-section error boundary. Without this, a server crash renders the
 * host's opaque "A server error occurred. ERROR 2046147232" page, which says
 * nothing about what actually broke. Next passes a `digest` that matches the
 * entry in the function logs, so surface it.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] render failed:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="font-display text-3xl">Something broke in the dashboard</h1>
      <p className="mt-3 text-sm text-muted">
        The storefront is unaffected — this is the admin section only.
      </p>

      <div className="mt-5 rounded-xl border border-accent/40 bg-accent/10 p-4">
        <p className="text-sm font-bold text-accent">{error.message || "Unknown error"}</p>
        {error.digest && (
          <p className="mt-2 font-mono text-[12px] text-muted">
            digest: {error.digest} — search this in Netlify → Logs → Functions
            for the stack trace.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={reset}
          className="glow-accent rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-accent-2"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-line-2 px-6 py-2.5 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
        >
          Back to dashboard
        </Link>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        If this keeps happening, open <code>/api/diag?key=&lt;admin password&gt;</code>{" "}
        — it reports the storage driver, runs a real read/write/list test, and
        checks mail delivery.
      </p>
    </div>
  );
}
