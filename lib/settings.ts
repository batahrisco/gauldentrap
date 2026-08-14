import { fsRead, kvGet, kvSet } from "@/lib/storage";

/* ── Payment methods ────────────────────────────────────────────────────
   The store ships worldwide out of USD, so the roster is international:
   bank wire, cards, the wallet buttons and crypto. Each one is independently
   switched on by the owner in /admin/settings — only enabled methods get a
   badge in the footer and a button at checkout. Advertising a method you
   can't actually take is the fastest way to lose a cart. */

export type PaymentMethodKey =
  | "bank"
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "paypal"
  | "applepay"
  | "googlepay"
  | "cashapp"
  | "zelle"
  | "venmo"
  | "bitcoin"
  | "ethereum"
  | "usdt"
  | "litecoin"
  | "monero"
  | "other";

export type PaymentMethodDef = {
  key: PaymentMethodKey;
  label: string;
  /** Grouping for the admin panel */
  section: "Bank" | "Cards" | "Wallets & apps" | "Crypto" | "Custom";
  /** Crypto methods get an address + network hint instead of account details */
  crypto: boolean;
  /** Placeholder shown in the admin details box */
  hint: string;
};

/** Every method the owner can advertise. Each has its own on/off switch. */
export const PAYMENT_METHODS: PaymentMethodDef[] = [
  {
    key: "bank",
    label: "Bank / Wire Transfer",
    section: "Bank",
    crypto: false,
    hint: "e.g. Beneficiary: Gauldentrap Ltd\nAccount: 000123456  Routing: 011000015\nor IBAN / SWIFT for international",
  },

  { key: "visa", label: "Visa", section: "Cards", crypto: false, hint: "payment link or processor customers are sent to" },
  { key: "mastercard", label: "Mastercard", section: "Cards", crypto: false, hint: "payment link or processor customers are sent to" },
  { key: "amex", label: "American Express", section: "Cards", crypto: false, hint: "payment link or processor customers are sent to" },
  { key: "discover", label: "Discover", section: "Cards", crypto: false, hint: "payment link or processor customers are sent to" },

  { key: "paypal", label: "PayPal", section: "Wallets & apps", crypto: false, hint: "e.g. paypal.me/gauldentrap or your PayPal email" },
  { key: "applepay", label: "Apple Pay", section: "Wallets & apps", crypto: false, hint: "e.g. the Apple Pay link or number to send to" },
  { key: "googlepay", label: "Google Pay", section: "Wallets & apps", crypto: false, hint: "e.g. the Google Pay link or number to send to" },
  { key: "cashapp", label: "Cash App", section: "Wallets & apps", crypto: false, hint: "e.g. $gauldentrap" },
  { key: "zelle", label: "Zelle", section: "Wallets & apps", crypto: false, hint: "e.g. the email or US phone number registered with Zelle" },
  { key: "venmo", label: "Venmo", section: "Wallets & apps", crypto: false, hint: "e.g. @gauldentrap" },

  { key: "bitcoin", label: "Bitcoin", section: "Crypto", crypto: true, hint: "BTC address\ne.g. bc1q…" },
  { key: "ethereum", label: "Ethereum", section: "Crypto", crypto: true, hint: "ETH address\ne.g. 0x…" },
  { key: "usdt", label: "USDT", section: "Crypto", crypto: true, hint: "USDT address + network\ne.g. TRC20: TX…" },
  { key: "litecoin", label: "Litecoin", section: "Crypto", crypto: true, hint: "LTC address\ne.g. ltc1…" },
  { key: "monero", label: "Monero", section: "Crypto", crypto: true, hint: "XMR address\ne.g. 4…" },

  { key: "other", label: "Other", section: "Custom", crypto: false, hint: "anything else you accept — gift cards, cash on collection…" },
];

/** Admin-panel section order. */
export const PAYMENT_SECTIONS = [
  "Bank",
  "Cards",
  "Wallets & apps",
  "Crypto",
  "Custom",
] as const;

export const PAYMENT_METHOD_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.key, m.label])
) as Record<PaymentMethodKey, string>;

export const PAYMENT_METHOD_KEYS = PAYMENT_METHODS.map((m) => m.key);

/* ── Socials ─────────────────────────────────────────────────────────── */

export type SocialKey =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "telegram"
  | "whatsapp";

/** Socials rendered from the `socials` map — a filled URL is the owner's opt-in. */
export const SOCIAL_KEYS: SocialKey[] = [
  "facebook",
  "instagram",
  "tiktok",
  "x",
  "youtube",
];

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  youtube: "YouTube",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
};

/* ── Settings ────────────────────────────────────────────────────────── */

/** Which messenger gets the floating bottom-left bubble. Tawk always takes
 *  the right, so only one of these can hold the left without them colliding.
 *  Both still appear on /contact and in the footer regardless. */
export type ChatSide = "whatsapp" | "telegram" | "none";

export type SiteSettings = {
  /** Digits with country code, no + (e.g. 447700900000) */
  whatsapp: string;
  /** Handle without @, or a full t.me URL */
  telegram: string;
  chatSide: ChatSide;
  livechatEmbed: string;
  /** Where order/contact alerts land. Editable here so a broken mailbox
   *  can be routed around without a redeploy. */
  notifyEmail: string;
  /** Address customers see as reply-to on transactional mail */
  replyTo: string;
  socials: Record<SocialKey, string>;
  payments: {
    /**
     * manual — customer picks a preferred method, places the order, and
     *   the owner follows up with payment details.
     * direct — the owner's saved method details show at checkout so the
     *   customer can pay immediately.
     */
    mode: "manual" | "direct";
    /** Owner's opt-in per method — drives the footer badges and checkout */
    enabled: Record<PaymentMethodKey, boolean>;
    /** Owner-entered details per method (account numbers, wallet addresses) */
    methods: Record<PaymentMethodKey, string>;
    /** Display name for the owner's custom "other" method */
    otherLabel: string;
  };
};

const blankMethods = () =>
  Object.fromEntries(PAYMENT_METHOD_KEYS.map((k) => [k, ""])) as Record<PaymentMethodKey, string>;

const blankSocials = () =>
  Object.fromEntries(
    (Object.keys(SOCIAL_LABELS) as SocialKey[]).map((k) => [k, ""])
  ) as Record<SocialKey, string>;

const DEFAULTS: SiteSettings = {
  whatsapp: "",
  telegram: "",
  chatSide: "whatsapp",
  livechatEmbed: "",
  notifyEmail: "",
  replyTo: "support@gauldentrap.com",
  socials: blankSocials(),
  payments: {
    mode: "manual",
    // Nothing is advertised until the owner switches it on.
    enabled: Object.fromEntries(PAYMENT_METHOD_KEYS.map((k) => [k, false])) as Record<
      PaymentMethodKey,
      boolean
    >,
    methods: blankMethods(),
    otherLabel: "",
  },
};

/** Methods switched on by the owner, in roster order. */
export function enabledPaymentMethods(s: SiteSettings): PaymentMethodDef[] {
  return PAYMENT_METHODS.filter((m) => s.payments.enabled[m.key]);
}

/** Normalises a stored telegram value (handle or URL) to a t.me link. */
export function telegramUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://t.me/${v.replace(/^@/, "")}`;
}

/** Normalises a stored WhatsApp number to a wa.me link. */
export function whatsappUrl(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

// Stored under the "site-settings" key (data/site-settings.json locally,
// Supabase in production). Read fresh on every call so admin saves apply
// without a restart.
export async function getSettings(): Promise<SiteSettings> {
  let raw: Partial<SiteSettings> | null = null;
  // Reads must never take the site down (or fail the build): a broken
  // key / missing table falls back to the committed defaults file.
  // Writes (saveSettings, orders) still fail loudly.
  try {
    raw = await kvGet<Partial<SiteSettings>>("site-settings");
  } catch (e) {
    console.error("[settings] storage read failed, using fallback:", e);
  }
  // First run on a fresh database: fall back to the committed defaults
  // file (ships in the repo) so livechat/socials/WhatsApp survive the
  // initial deploy; the first admin save then persists to the database.
  if (!raw) raw = fsRead<Partial<SiteSettings>>("site-settings");
  if (!raw) return structuredClone(DEFAULTS);
  return {
    whatsapp: raw.whatsapp ?? "",
    telegram: raw.telegram ?? "",
    chatSide:
      raw.chatSide === "telegram" || raw.chatSide === "none" ? raw.chatSide : "whatsapp",
    livechatEmbed: raw.livechatEmbed ?? "",
    notifyEmail: raw.notifyEmail ?? "",
    replyTo: raw.replyTo || DEFAULTS.replyTo,
    socials: { ...blankSocials(), ...raw.socials },
    payments: {
      mode: raw.payments?.mode === "direct" ? "direct" : "manual",
      enabled: { ...DEFAULTS.payments.enabled, ...raw.payments?.enabled },
      methods: { ...blankMethods(), ...raw.payments?.methods },
      otherLabel: raw.payments?.otherLabel ?? "",
    },
  };
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await kvSet("site-settings", settings);
}
