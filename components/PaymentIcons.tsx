/**
 * Payment badges — one per method the owner can switch on in /admin/settings.
 * Drawn as simple geometric marks on a 46×30 chip so they read at footer size
 * and need no external assets (the CSP-free, zero-request approach).
 */

function Chip({
  children,
  bg = "#fff",
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <svg width="46" height="30" viewBox="0 0 46 30" aria-hidden>
      <rect width="46" height="30" rx="5" fill={bg} />
      {children}
    </svg>
  );
}

/* ── Card schemes ── */

export function VisaIcon() {
  return (
    <Chip>
      <text
        x="23" y="20.5" textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif" fontSize="12.5"
        fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="0.3"
      >
        VISA
      </text>
    </Chip>
  );
}

export function MastercardIcon() {
  return (
    <Chip bg="#1a1a1a">
      <circle cx="19" cy="15" r="8" fill="#EB001B" />
      <circle cx="27" cy="15" r="8" fill="#F79E1B" />
      {/* the overlap reads as Mastercard's interlock */}
      <path
        d="M23 9.1a8 8 0 0 0 0 11.8 8 8 0 0 0 0-11.8z"
        fill="#FF5F00"
      />
    </Chip>
  );
}

export function AmexIcon() {
  return (
    <Chip bg="#1F72CD">
      <text
        x="23" y="14.5" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="7" fontWeight="800" fill="#fff"
      >
        AMERICAN
      </text>
      <text
        x="23" y="22" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="7" fontWeight="800" fill="#fff"
      >
        EXPRESS
      </text>
    </Chip>
  );
}

export function DiscoverIcon() {
  return (
    <Chip>
      <text
        x="20" y="19" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="8" fontWeight="800" fill="#231F20"
      >
        DISC
      </text>
      <circle cx="35" cy="15.5" r="6" fill="#FF6000" />
    </Chip>
  );
}

/* ── Wallets ── */

export function PayPalIcon() {
  return (
    <Chip>
      {/* the double-P mark, back layer then front */}
      <path
        d="M14.5 22.5 16.6 8.2h6.1c3 0 4.7 1.5 4.3 4.1-.5 3-2.7 4.6-6 4.6h-2.2l-.8 5.6z"
        fill="#002C8A"
      />
      <path
        d="M18.8 25.2 20.9 11h5.5c2.8 0 4.4 1.4 4 3.9-.5 2.9-2.6 4.4-5.8 4.4h-2.1l-.8 5.9z"
        fill="#009BE1"
        opacity="0.85"
      />
      <text
        x="33" y="19" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="8.5" fontWeight="800"
        fontStyle="italic" fill="#002C8A"
      >
        Pal
      </text>
    </Chip>
  );
}

export function ApplePayIcon() {
  return (
    <Chip bg="#000">
      <path
        fill="#fff"
        transform="translate(9 7.5) scale(0.6)"
        d="M12.1 4.9c.6-.8 1.1-1.9.9-3-1 .1-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1 0 2.2-.6 2.9-1.4zm.9 1.6c-1.6-.1-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-3.9 2.4-1.7 2.9-.5 7.2 1.2 9.5.8 1.2 1.8 2.4 3 2.4 1.2-.1 1.7-.8 3.1-.8s1.9.8 3.2.7c1.3 0 2.2-1.2 3-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.6-3.8 0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9z"
      />
      <text
        x="26" y="19.5" fontFamily="Arial, sans-serif" fontSize="10.5" fontWeight="500" fill="#fff">
        Pay
      </text>
    </Chip>
  );
}

export function GooglePayIcon() {
  return (
    <Chip>
      <g transform="translate(7 7) scale(0.66)">
        <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z" />
        <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 24z" />
        <path fill="#FBBC04" d="M5.6 14.7a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4z" />
        <path fill="#EA4335" d="M12 4.6c1.7 0 3.2.6 4.4 1.7L19.7 3A11.5 11.5 0 0 0 1.8 7.3l3.8 3C6.5 6.6 9 4.6 12 4.6z" />
      </g>
      <text x="26" y="19.5" fontFamily="Arial, sans-serif" fontSize="10.5" fontWeight="500" fill="#5F6368">
        Pay
      </text>
    </Chip>
  );
}

export function CashAppIcon() {
  return (
    <Chip bg="#00D54B">
      {/* rounded-square mark with the dollar glyph */}
      <text
        x="23" y="22" textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif" fontSize="17" fontWeight="900" fill="#fff"
      >
        $
      </text>
    </Chip>
  );
}

export function ZelleIcon() {
  return (
    <Chip bg="#6D1ED4">
      <text
        x="23" y="21" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="16" fontWeight="800" fill="#fff"
      >
        Z
      </text>
      {/* the vertical stroke through the Z, as in the Zelle mark */}
      <rect x="22.2" y="5" width="1.6" height="20" fill="#fff" />
    </Chip>
  );
}

export function VenmoIcon() {
  return (
    <Chip bg="#008CFF">
      <text
        x="23" y="21" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="17" fontWeight="800" fontStyle="italic" fill="#fff"
      >
        V
      </text>
    </Chip>
  );
}

/* ── Bank ── */

export function BankTransferIcon() {
  return (
    <Chip bg="#1c3f5e">
      <g fill="#fff" transform="translate(6.5 8)">
        <path d="M6 0 0 3.4h12z" />
        <rect x="0.6" y="4.4" width="1.8" height="6" />
        <rect x="5.1" y="4.4" width="1.8" height="6" />
        <rect x="9.6" y="4.4" width="1.8" height="6" />
        <rect x="0" y="11.2" width="12" height="1.9" />
      </g>
      <text x="22" y="19.5" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="800" fill="#fff">
        WIRE
      </text>
    </Chip>
  );
}

/* ── Crypto ── */

export function BitcoinIcon() {
  return (
    <Chip bg="#F7931A">
      <circle cx="14" cy="15" r="9" fill="#fff" fillOpacity="0.18" />
      <text
        x="14" y="21" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800" fill="#fff"
      >
        ₿
      </text>
      <text x="24" y="19.5" fontFamily="Arial, sans-serif" fontSize="9.5" fontWeight="800" fill="#fff">
        BTC
      </text>
    </Chip>
  );
}

export function EthereumIcon() {
  return (
    <Chip bg="#3C3C3D">
      <g transform="translate(9 6) scale(0.62)" fillRule="evenodd">
        <path fill="#fff" fillOpacity="0.75" d="M6 0 0 10l6 3.5z" />
        <path fill="#fff" d="M6 0v13.5L12 10z" />
        <path fill="#fff" fillOpacity="0.75" d="M6 15.1 0 11.6 6 20z" />
        <path fill="#fff" d="M6 20v-4.9l6-3.5z" />
      </g>
      <text x="23" y="19.5" fontFamily="Arial, sans-serif" fontSize="9.5" fontWeight="800" fill="#fff">
        ETH
      </text>
    </Chip>
  );
}

export function UsdtIcon() {
  return (
    <Chip bg="#26A17B">
      <text
        x="23" y="20.5" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="11" fontWeight="800" fill="#fff"
      >
        USDT
      </text>
    </Chip>
  );
}

export function LitecoinIcon() {
  return (
    <Chip bg="#345D9D">
      <path d="M15 8h4l-2 8 3-1-.6 2.4-3 1-.7 2.6H25l-.7 3H12l1.4-5.6-2.4.9.6-2.4 2.4-.9z" fill="#fff" />
      <text x="27" y="19.5" fontFamily="Arial, sans-serif" fontSize="9.5" fontWeight="800" fill="#fff">
        LTC
      </text>
    </Chip>
  );
}

export function MoneroIcon() {
  return (
    <Chip bg="#FF6600">
      <text
        x="23" y="21" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800" fill="#fff"
      >
        ɱ
      </text>
    </Chip>
  );
}

/* ── Fallback for the owner's custom method ── */

export function OtherPaymentIcon() {
  return (
    <Chip bg="#2e2a20">
      <rect x="8" y="9" width="30" height="13" rx="2.5" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
      <path d="M8 13.5h30" stroke="var(--accent)" strokeWidth="1.6" />
      <circle cx="12.5" cy="18.5" r="1.4" fill="var(--accent)" />
    </Chip>
  );
}

/** One icon per payment method key — see PAYMENT_METHODS in lib/settings.ts. */
export const PAYMENT_ICONS: Record<string, () => React.ReactElement> = {
  bank: BankTransferIcon,
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  discover: DiscoverIcon,
  paypal: PayPalIcon,
  applepay: ApplePayIcon,
  googlepay: GooglePayIcon,
  cashapp: CashAppIcon,
  zelle: ZelleIcon,
  venmo: VenmoIcon,
  bitcoin: BitcoinIcon,
  ethereum: EthereumIcon,
  usdt: UsdtIcon,
  litecoin: LitecoinIcon,
  monero: MoneroIcon,
  other: OtherPaymentIcon,
};
