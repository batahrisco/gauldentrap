import { requireAdmin } from "@/lib/admin";
import {
  PAYMENT_METHODS,
  PAYMENT_SECTIONS,
  SOCIAL_KEYS,
  SOCIAL_LABELS,
  getSettings,
} from "@/lib/settings";
import { changePasswordAction, saveSettingsAction } from "@/app/admin/actions";
import { PAYMENT_ICONS } from "@/components/PaymentIcons";

const input =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent";

const PW_ERRORS: Record<string, string> = {
  wrong: "Current password is incorrect.",
  short: "New password must be at least 8 characters.",
  match: "New passwords don't match.",
};

const SOCIAL_PLACEHOLDER: Record<string, string> = {
  facebook: "https://facebook.com/gauldentrap",
  instagram: "https://instagram.com/gauldentrap",
  tiktok: "https://tiktok.com/@gauldentrap",
  x: "https://x.com/gauldentrap",
  youtube: "https://youtube.com/@gauldentrap",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; pwsaved?: string; pwerr?: string }>;
}) {
  await requireAdmin();
  const { saved, pwsaved, pwerr } = await searchParams;
  const s = await getSettings();

  return (
    <div>
      <h1 className="font-display text-3xl">Settings</h1>
      {saved && (
        <p className="mt-3 inline-block rounded-lg border border-verify/40 bg-verify/10 px-4 py-2 text-sm font-semibold text-verify">
          Saved — live on the store now.
        </p>
      )}

      <form action={saveSettingsAction} className="mt-6 space-y-6">
        {/* ── Payment methods ── */}
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Payment methods
          </h2>
          <p className="mt-1.5 text-xs text-muted">
            Tick a method to advertise it. Ticked methods show their badge in
            the footer <b>and</b> become a choice at checkout — nothing else
            appears anywhere on the site.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line-2 p-4 has-[:checked]:border-accent has-[:checked]:bg-accent/5">
              <input
                type="radio"
                name="paymentMode"
                value="manual"
                defaultChecked={s.payments.mode === "manual"}
                className="mt-1 accent-[#ffc61a]"
              />
              <span className="text-sm">
                <b>Manual</b>
                <br />
                <span className="text-muted">
                  Customer picks a preferred method and places the order — you
                  email them the payment details to proceed.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line-2 p-4 has-[:checked]:border-accent has-[:checked]:bg-accent/5">
              <input
                type="radio"
                name="paymentMode"
                value="direct"
                defaultChecked={s.payments.mode === "direct"}
                className="mt-1 accent-[#ffc61a]"
              />
              <span className="text-sm">
                <b>Direct</b>
                <br />
                <span className="text-muted">
                  Your details below show at checkout so customers can pay
                  immediately. Only ticked, filled-in methods appear.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-5 space-y-6">
            {PAYMENT_SECTIONS.map((section) => {
              const methods = PAYMENT_METHODS.filter((m) => m.section === section);
              if (!methods.length) return null;
              return (
                <div key={section}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">
                    {section}
                  </p>
                  <div className="mt-2.5 space-y-2">
                    {methods.map((m) => {
                      const Icon = PAYMENT_ICONS[m.key];
                      return (
                        <div
                          key={m.key}
                          className="rounded-lg border border-line-2 p-3.5 has-[:checked]:border-accent/60 has-[:checked]:bg-accent/[0.04]"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
                              <input
                                type="checkbox"
                                name={`enabled_${m.key}`}
                                defaultChecked={s.payments.enabled[m.key]}
                                className="h-4 w-4 accent-[#ffc61a]"
                              />
                              {m.label}
                            </label>
                            <span className="ml-auto">{Icon && <Icon />}</span>
                          </div>
                          <textarea
                            name={`method_${m.key}`}
                            defaultValue={s.payments.methods[m.key]}
                            placeholder={m.hint}
                            rows={m.crypto ? 2 : 3}
                            className={`${input} mt-3 font-mono text-[12.5px]`}
                          />
                          {m.key === "other" && (
                            <input
                              name="otherLabel"
                              defaultValue={s.payments.otherLabel}
                              placeholder="Name for this method at checkout — e.g. Gift card"
                              className={`${input} mt-2`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Messengers & livechat ── */}
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Messengers &amp; livechat
          </h2>
          <p className="mt-1.5 text-xs text-muted">
            Livechat always floats bottom-right. Pick which messenger floats
            bottom-left — only one fits without the two overlapping. Both still
            appear on the contact page and in the footer either way.
          </p>

          <div className="mt-4 grid gap-3">
            <label className="text-sm">
              <span className="font-semibold">WhatsApp number</span>{" "}
              <span className="text-muted">(country code, no +; empty = hidden)</span>
              <input
                name="whatsapp"
                defaultValue={s.whatsapp}
                placeholder="447700900000"
                className={`${input} mt-1.5`}
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Telegram</span>{" "}
              <span className="text-muted">(handle or full t.me link; empty = hidden)</span>
              <input
                name="telegram"
                defaultValue={s.telegram}
                placeholder="gauldentrap"
                className={`${input} mt-1.5`}
              />
            </label>

            <fieldset className="mt-1">
              <legend className="text-sm font-semibold">Floating button (bottom-left)</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["whatsapp", "WhatsApp"],
                    ["telegram", "Telegram"],
                    ["none", "None"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line-2 px-4 py-2.5 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5"
                  >
                    <input
                      type="radio"
                      name="chatSide"
                      value={value}
                      defaultChecked={s.chatSide === value}
                      className="accent-[#ffc61a]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="text-sm">
              <span className="font-semibold">Livechat embed code</span>{" "}
              <span className="text-muted">(paste the Tawk.to snippet; empty = no chat)</span>
              <textarea
                name="livechatEmbed"
                defaultValue={s.livechatEmbed}
                rows={4}
                placeholder="<script>…tawk.to…</script>"
                className={`${input} mt-1.5 font-mono text-[12px]`}
              />
            </label>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Notifications
          </h2>
          <p className="mt-1.5 text-xs text-muted">
            Where new orders, contact messages and signups are emailed. Change
            it here if the support mailbox goes down — no redeploy needed.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-semibold">Send alerts to</span>
              <input
                type="email"
                name="notifyEmail"
                defaultValue={s.notifyEmail}
                placeholder="you@example.com"
                className={`${input} mt-1.5`}
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Reply-to shown to customers</span>
              <input
                type="email"
                name="replyTo"
                defaultValue={s.replyTo}
                placeholder="support@gauldentrap.com"
                className={`${input} mt-1.5`}
              />
            </label>
          </div>
        </section>

        {/* ── Socials ── */}
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Social links
          </h2>
          <p className="mt-1.5 text-xs text-muted">
            Fill a URL to show that icon in the footer and on the contact page.
            Leave it empty and the icon stays hidden.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SOCIAL_KEYS.map((k) => (
              <label key={k} className="text-sm">
                <span className="font-semibold">{SOCIAL_LABELS[k]}</span>
                <input
                  name={k}
                  defaultValue={s.socials[k]}
                  placeholder={SOCIAL_PLACEHOLDER[k]}
                  className={`${input} mt-1.5`}
                />
              </label>
            ))}
          </div>
        </section>

        <button className="glow-accent rounded-lg bg-accent px-8 py-3 text-sm font-extrabold uppercase tracking-wide text-ink transition hover:bg-accent-2">
          Save settings
        </button>
      </form>

      {/* Separate form — password changes shouldn't ride along with settings */}
      <section className="mt-10 rounded-xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
          Admin password
        </h2>
        {pwsaved && (
          <p className="mt-3 inline-block rounded-lg border border-verify/40 bg-verify/10 px-4 py-2 text-sm font-semibold text-verify">
            Password changed — use it next time you sign in.
          </p>
        )}
        {pwerr && (
          <p className="mt-3 inline-block rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
            {PW_ERRORS[pwerr] ?? "Couldn't change the password."}
          </p>
        )}
        <form action={changePasswordAction} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="password"
            name="currentPassword"
            required
            placeholder="Current password"
            className={input}
          />
          <input
            type="password"
            name="newPassword"
            required
            minLength={8}
            placeholder="New password (min 8 chars)"
            className={input}
          />
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="Repeat new password"
            className={input}
          />
          <div className="sm:col-span-3">
            <button className="rounded-lg border border-line-2 bg-surface-2 px-6 py-2.5 text-sm font-bold text-foreground transition hover:border-accent hover:text-accent">
              Change password
            </button>
            <p className="mt-2 text-xs text-muted">
              Changing the password signs out every other admin session.
              Recovery: delete <code>data/admin-auth.json</code> on the server
              to fall back to the ADMIN_PASSWORD from .env.local.
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
