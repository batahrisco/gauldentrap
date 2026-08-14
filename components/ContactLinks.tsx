import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  TikTokIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons";
import {
  SOCIAL_KEYS,
  SOCIAL_LABELS,
  telegramUrl,
  whatsappUrl,
  type SiteSettings,
} from "@/lib/settings";

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  x: XIcon,
  youtube: YouTubeIcon,
} as const;

/**
 * WhatsApp and Telegram both appear here whichever one the owner picked for
 * the floating bubble — the float is a single-slot decision, this is the
 * full contact list. Socials render only where a URL has been filled in.
 */
export default function ContactLinks({
  settings,
  size = 26,
  className = "",
}: {
  settings: SiteSettings;
  size?: number;
  className?: string;
}) {
  const wa = whatsappUrl(settings.whatsapp);
  const tg = telegramUrl(settings.telegram);

  const links: { url: string; label: string; node: React.ReactNode }[] = [];
  if (wa)
    links.push({
      url: wa,
      label: SOCIAL_LABELS.whatsapp,
      node: (
        <span
          className="flex items-center justify-center rounded-full bg-[#25D366]"
          style={{ width: size, height: size }}
        >
          <WhatsAppIcon size={size * 0.78} />
        </span>
      ),
    });
  if (tg)
    links.push({
      url: tg,
      label: SOCIAL_LABELS.telegram,
      node: (
        <span
          className="flex items-center justify-center rounded-full bg-[#29A9EB]"
          style={{ width: size, height: size }}
        >
          <TelegramIcon size={size * 0.78} />
        </span>
      ),
    });
  for (const key of SOCIAL_KEYS) {
    const url = settings.socials[key];
    if (!url) continue;
    const Icon = SOCIAL_ICONS[key as keyof typeof SOCIAL_ICONS];
    links.push({ url, label: SOCIAL_LABELS[key], node: <Icon size={size} /> });
  }

  if (!links.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {links.map(({ url, label, node }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="transition hover:-translate-y-0.5"
        >
          {node}
        </a>
      ))}
    </div>
  );
}
