import { hashGetAll, hashSet } from "@/lib/storage";

export type OrderItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  /** Weight/size option chosen at checkout, e.g. "3.5g" */
  variant?: string | null;
  qty: number;
};

export type OrderStatus =
  | "new"
  | "awaiting-payment"
  | "paid"
  | "shipped"
  | "cancelled";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentMode: "manual" | "direct";
  paymentMethod: string;
  paymentOther?: string;
  paymentReference?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    /** City / town */
    suburb: string;
    /** State, province or region — free text, the store ships worldwide */
    state: string;
    /** Postal / ZIP code */
    postcode: string;
    /** ISO-ish country name as picked at checkout */
    country?: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountCode?: string;
  discount?: number;
  /** subtotal minus discount; older orders may lack it — fall back to subtotal */
  total?: number;
};

const HASH = "orders";

/**
 * Defensive on purpose: one malformed record used to throw from the sort
 * (`b.createdAt.localeCompare` on an undefined) and take down every page
 * that reads orders. A bad record must never hide the good ones.
 */
export async function readOrders(): Promise<Order[]> {
  const map = await hashGetAll<Order>(HASH);
  return Object.values(map)
    .filter(
      (o): o is Order =>
        !!o &&
        typeof o === "object" &&
        typeof o.id === "string" &&
        // the admin table dereferences both of these directly
        !!o.customer &&
        Array.isArray(o.items)
    )
    .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
}

/** Order records that would break the dashboard — reported by /api/diag. */
export async function inspectOrders(): Promise<{
  total: number;
  usable: number;
  problems: { key: string; missing: string[] }[];
}> {
  const map = await hashGetAll<Record<string, unknown>>(HASH);
  const required = ["id", "createdAt", "status", "customer", "items", "subtotal"];
  const problems: { key: string; missing: string[] }[] = [];
  for (const [key, value] of Object.entries(map)) {
    if (!value || typeof value !== "object") {
      problems.push({ key, missing: ["(not an object)"] });
      continue;
    }
    const missing = required.filter((f) => (value as Record<string, unknown>)[f] == null);
    if (missing.length) problems.push({ key, missing });
  }
  const total = Object.keys(map).length;
  return { total, usable: total - problems.length, problems };
}

export async function addOrder(order: Order): Promise<void> {
  await hashSet(HASH, order.id, order);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<boolean> {
  const map = await hashGetAll<Order>(HASH);
  const order = map[id];
  if (!order) return false;
  order.status = status;
  await hashSet(HASH, id, order);
  return true;
}

export function newOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `GT-${stamp}${rand}`;
}
