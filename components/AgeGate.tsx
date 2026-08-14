"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AGE_OK_KEY } from "@/lib/discount";

export default function AgeGate() {
  const [status, setStatus] = useState<"pending" | "open" | "confirmed">("pending");

  useEffect(() => {
    setStatus(localStorage.getItem(AGE_OK_KEY) === "1" ? "confirmed" : "open");
  }, []);

  if (status !== "open") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md">
      <div className="w-full max-w-[440px] rounded-2xl border border-line-2 bg-surface p-9 text-center shadow-[0_30px_80px_rgba(0,0,0,.9)]">
        <Image
          src="/logo.png"
          alt="Gauldentrap"
          width={72}
          height={72}
          priority
          className="mx-auto h-[68px] w-auto drop-shadow-[0_0_16px_var(--glow)]"
        />
        <h1 className="font-display mt-5 text-[clamp(26px,5vw,34px)] tracking-[0.04em]">
          ARE YOU 21 OR OLDER?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          You must be of legal age in your area to enter this site and purchase
          cannabis products.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={() => {
              localStorage.setItem(AGE_OK_KEY, "1");
              // let the offer popup know it can start its timer
              window.dispatchEvent(new Event("age-confirmed"));
              setStatus("confirmed");
            }}
            className="glow-accent flex-1 rounded-lg bg-accent px-4 py-3.5 text-sm font-extrabold uppercase tracking-wider text-ink transition hover:bg-accent-2"
          >
            Yes, Enter
          </button>
          <a
            href="https://www.google.com"
            className="flex-1 rounded-lg border border-line-2 px-4 py-3.5 text-sm font-semibold text-muted transition hover:bg-surface-2"
          >
            No, Exit
          </a>
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-muted/70">
          By entering you confirm you are of legal age in your jurisdiction and
          agree to our Terms. Keep all products out of reach of children.
        </p>
      </div>
    </div>
  );
}
