import { PAYMENT_ICONS } from "@/components/PaymentIcons";
import { enabledPaymentMethods, type SiteSettings } from "@/lib/settings";

/**
 * The payment marks the owner switched on, rendered identically in the
 * footer and at checkout so what a shopper is promised on the way in is what
 * they're offered at the till.
 */
export default function PaymentBadges({
  settings,
  className = "",
}: {
  settings: SiteSettings;
  className?: string;
}) {
  const methods = enabledPaymentMethods(settings);
  if (!methods.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {methods.map((m) => {
        const Icon = PAYMENT_ICONS[m.key];
        if (!Icon) return null;
        const label =
          m.key === "other" && settings.payments.otherLabel
            ? settings.payments.otherLabel
            : m.label;
        return (
          <span key={m.key} title={label} className="opacity-90 transition hover:opacity-100">
            <Icon />
          </span>
        );
      })}
    </div>
  );
}
