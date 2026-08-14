// Social and messenger marks. Payment badges live in PaymentIcons.tsx.
// All drawn inline so there are no external asset requests.

export function FacebookIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.4 21v-6.8h2.3l.35-2.65H13.4V9.85c0-.77.21-1.29 1.32-1.29h1.41V6.19c-.24-.03-1.08-.1-2.06-.1-2.04 0-3.43 1.24-3.43 3.53v1.93H8.35v2.65h2.29V21z"
      />
    </svg>
  );
}

export function InstagramIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <radialGradient id="ig-g" cx="0.3" cy="1.1" r="1.3">
          <stop offset="0" stopColor="#FDF497" />
          <stop offset="0.25" stopColor="#FD5949" />
          <stop offset="0.6" stopColor="#D6249F" />
          <stop offset="1" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6.5" fill="url(#ig-g)" />
      <rect
        x="5.2" y="5.2" width="13.6" height="13.6" rx="4"
        fill="none" stroke="#fff" strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16.4" cy="7.6" r="1.15" fill="#fff" />
    </svg>
  );
}

export function TikTokIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="6.5" fill="#010101" />
      <path
        fill="#25F4EE"
        d="M13.2 4.6c.4 2 1.9 3.5 4.1 3.7v2.5c-1.5 0-2.9-.5-4.1-1.3v5.1a5.1 5.1 0 1 1-5.1-5.1c.3 0 .7 0 1 .1v2.7a2.4 2.4 0 1 0 1.8 2.3V4.6z"
        transform="translate(-.6 .4)"
      />
      <path
        fill="#FE2C55"
        d="M13.2 4.6c.4 2 1.9 3.5 4.1 3.7v2.5c-1.5 0-2.9-.5-4.1-1.3v5.1a5.1 5.1 0 1 1-5.1-5.1c.3 0 .7 0 1 .1v2.7a2.4 2.4 0 1 0 1.8 2.3V4.6z"
        transform="translate(.6 -.2)"
      />
      <path
        fill="#fff"
        d="M13.2 4.6c.4 2 1.9 3.5 4.1 3.7v2.5c-1.5 0-2.9-.5-4.1-1.3v5.1a5.1 5.1 0 1 1-5.1-5.1c.3 0 .7 0 1 .1v2.7a2.4 2.4 0 1 0 1.8 2.3V4.6z"
      />
    </svg>
  );
}

export function XIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="6.5" fill="#000" />
      <path
        fill="#fff"
        d="M5.5 5h4.1l3 4.3L16.4 5h2.3l-5 5.9 5.5 8.1h-4.1l-3.3-4.8-4.1 4.8H5.4l5.6-6.5z"
      />
    </svg>
  );
}

export function YouTubeIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="1" y="4.5" width="22" height="15" rx="4" fill="#FF0000" />
      <path fill="#fff" d="M10 9.2v5.6l5-2.8z" />
    </svg>
  );
}

/* ── Messengers ──
   Glyph only (white on transparent) so the caller supplies the brand-colour
   disc — that way the same mark works on the float, in the footer and on the
   contact page at any size. */

export function WhatsAppIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path
        fill="#fff"
        d="M16 5.3A10.6 10.6 0 0 0 6.9 21.3L5.6 26l4.9-1.3A10.6 10.6 0 1 0 16 5.3zm0 2.1a8.5 8.5 0 0 1 0 17 8.4 8.4 0 0 1-4.4-1.2l-.3-.2-2.9.8.8-2.8-.2-.3a8.5 8.5 0 0 1 7-13.3z"
      />
      <path
        fill="#fff"
        d="M12.4 11.1c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.5 1.1 2.6c.1.2 1.8 2.8 4.4 3.9 2.2.9 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.8-.9c-.2-.1-.4-.2-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.1-.3 0-.4.1-.5l.4-.5.3-.5c.1-.2 0-.4 0-.5z"
      />
    </svg>
  );
}

export function TelegramIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path
        fill="#fff"
        d="M24.9 8.1 21.4 24c-.26 1.16-.95 1.44-1.92.9l-5.3-3.9-2.56 2.46c-.28.28-.52.52-1.07.52l.38-5.4L20.75 10c.43-.38-.09-.6-.66-.22L7.9 17.44l-5.24-1.64c-1.14-.36-1.16-1.14.24-1.68L23.4 6.42c.95-.35 1.78.22 1.5 1.68z"
      />
    </svg>
  );
}
