import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { readOrders } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { hashCount, storeError } from "@/lib/storage";

export default async function AdminDashboard() {
  await requireAdmin();
  // Every one of these hits storage. A single failure used to 500 the whole
  // dashboard; now it degrades and the banner below says so.
  const orders = await readOrders().catch(() => []);
  const settings = await getSettings();
  const subscribers = await hashCount("subscribers").catch(() => 0);
  const customProducts = await hashCount("custom-products").catch(() => 0);
  const storageWarning = storeError();
  const newOrders = orders.filter((o) => o.status === "new" || o.status === "awaiting-payment");
  const revenue = orders
    .filter((o) => o.status === "paid" || o.status === "shipped")
    .reduce((n, o) => n + o.subtotal, 0);

  const cards = [
    { label: "Orders needing action", value: newOrders.length, href: "/admin/orders" },
    { label: "Total orders", value: orders.length, href: "/admin/orders" },
    { label: "Revenue (paid + shipped)", value: `$${revenue.toFixed(2)}`, href: "/admin/orders" },
    { label: "Subscribers", value: subscribers, href: "/admin" },
    { label: "Products you added", value: customProducts, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>

      {storageWarning && (
        <div className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
          <p className="font-bold text-accent">Storage problem — figures below may be incomplete</p>
          <p className="mt-1.5 font-mono text-[12px] leading-relaxed text-muted">
            {storageWarning}
          </p>
          <p className="mt-2 text-xs text-muted">
            Run <code>/api/diag?key=…</code> for the full picture. Orders are
            still being written; this affects reading them back.
          </p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-line bg-surface p-5 transition hover:border-accent/50"
          >
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="mt-1 text-xs text-muted">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-line bg-surface p-5 text-sm">
        <h2 className="font-bold">Store status</h2>
        <ul className="mt-3 space-y-1.5 text-muted">
          <li>
            Checkout mode:{" "}
            <b className="text-foreground">
              {settings.payments.mode === "direct"
                ? "Direct — customers see your payment details"
                : "Manual — you email payment details after each order"}
            </b>
          </li>
          <li>
            WhatsApp button:{" "}
            <b className="text-foreground">{settings.whatsapp ? "on" : "off"}</b>{" "}
            · Livechat:{" "}
            <b className="text-foreground">
              {/embed\.tawk\.to/.test(settings.livechatEmbed) ? "on (Tawk.to)" : "off"}
            </b>{" "}
            · Socials:{" "}
            <b className="text-foreground">
              {Object.values(settings.socials).filter(Boolean).length} linked
            </b>
          </li>
        </ul>
        <Link href="/admin/settings" className="mt-3 inline-block text-accent hover:underline">
          Change settings →
        </Link>
      </div>
    </div>
  );
}
