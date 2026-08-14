import { enabledPaymentMethods, getSettings } from "@/lib/settings";
import CheckoutForm from "@/components/CheckoutForm";
import PaymentBadges from "@/components/PaymentBadges";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await getSettings();
  // Exactly what the owner ticked in the admin panel — same source as the
  // footer badges, so a shopper is never offered a method that wasn't
  // advertised (or promised one that isn't on the checkout).
  const methods = enabledPaymentMethods(settings).map((m) => ({
    key: m.key,
    label:
      m.key === "other" && settings.payments.otherLabel
        ? settings.payments.otherLabel
        : m.label,
  }));

  return (
    <>
      <CheckoutForm
        mode={settings.payments.mode}
        methodDetails={settings.payments.methods}
        otherLabel={settings.payments.otherLabel}
        methods={methods}
      />
      {methods.length > 0 && (
        <div className="mx-auto max-w-[1380px] px-4 pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">
            Accepted here
          </p>
          <PaymentBadges settings={settings} className="mt-3" />
        </div>
      )}
    </>
  );
}
