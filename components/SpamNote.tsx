/**
 * Replies from the owner's mailbox (support@) are landing in spam, while the
 * automated noreply@ mail — sent through Resend, which is DKIM-signed for the
 * domain — reaches the inbox. Until the sending domain's DNS is sorted, tell
 * people where to look and ask them to train their filter.
 */
export const SUPPORT_ADDRESS = "support@gauldentrap.com";

export default function SpamNote({
  variant = "reply",
  className = "",
}: {
  /** "reply" — we're about to email you; "sent" — you just emailed us */
  variant?: "reply" | "sent";
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-accent/30 bg-accent/[0.07] p-4 text-left ${className}`}
    >
      <p className="flex items-center gap-2 text-[13px] font-bold text-accent">
        <span aria-hidden>📩</span>
        Check your spam folder
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
        {variant === "reply" ? "Our reply comes from " : "We'll reply from "}
        <b className="text-foreground">{SUPPORT_ADDRESS}</b> and can land in
        spam or promotions. Please check there if you don&apos;t see it within
        a few minutes, and mark it{" "}
        <b className="text-foreground">&ldquo;Not spam&rdquo;</b> so future
        messages reach your inbox. Adding the address to your contacts helps too.
      </p>
    </div>
  );
}
