import { TelegramIcon, WhatsAppIcon } from "@/components/icons";
import { telegramUrl, whatsappUrl, type SiteSettings } from "@/lib/settings";

/**
 * The floating messenger bubble, bottom-LEFT. Tawk.to always takes the
 * bottom-right, so only one messenger can hold the left without the two
 * overlapping — the owner picks which in /admin/settings. Both remain
 * reachable from the footer and /contact either way.
 */
export default function ChatFloat({ settings }: { settings: SiteSettings }) {
  const choice = settings.chatSide;
  if (choice === "none") return null;

  const isWhatsApp = choice === "whatsapp";
  const href = isWhatsApp ? whatsappUrl(settings.whatsapp) : telegramUrl(settings.telegram);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={isWhatsApp ? "Chat on WhatsApp" : "Chat on Telegram"}
      className="chat-float fixed bottom-5 left-5 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full transition hover:scale-105"
      style={{
        background: isWhatsApp ? "#25D366" : "#29A9EB",
        // the pulse ring picks up the button's own colour
        ["--chat-pulse" as string]: isWhatsApp
          ? "rgba(37,211,102,.45)"
          : "rgba(41,169,235,.45)",
      }}
    >
      {isWhatsApp ? <WhatsAppIcon size={30} /> : <TelegramIcon size={30} />}
    </a>
  );
}
