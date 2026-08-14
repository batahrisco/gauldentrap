// Storage layer with two drivers:
//  - Netlify Blobs in production — no account, no keys, no schema; the
//    store is provisioned automatically for the site.
//  - Local JSON files under data/ otherwise — used in dev, zero setup.
// Server-only. Everything the app persists (orders, subscribers, settings,
// admin auth) is key-value, which is exactly what Blobs is.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type Store = {
  get(key: string, opts?: { type: "json" }): Promise<unknown>;
  setJSON(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string }): Promise<{ blobs: { key: string }[] }>;
};

/**
 * Ask for a blob store, or null if we're not running somewhere that has one.
 *
 * Deliberately NOT gated on `process.env.NETLIFY`: that's set during builds
 * but isn't guaranteed inside the function runtime, and gating on it made
 * every write fall through to the read-only filesystem and fail. getStore()
 * throws when there's no blobs context, so trying it IS the check.
 *
 * If automatic context is unavailable, NETLIFY_SITE_ID + NETLIFY_API_TOKEN
 * are used as the documented manual fallback.
 */
const stores = new Map<string, Store | null>();
let lastStoreError: string | null = null;

export function storeError(): string | null {
  return lastStoreError;
}

async function store(name: string): Promise<Store | null> {
  if (stores.has(name)) return stores.get(name)!;
  let resolved: Store | null = null;
  try {
    const { getStore } = await import("@netlify/blobs");
    const siteID = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_API_TOKEN;
    resolved = getStore(
      siteID && token
        ? { name, consistency: "strong", siteID, token }
        : { name, consistency: "strong" }
    ) as unknown as Store;
    lastStoreError = null;
  } catch (e) {
    lastStoreError = String((e as Error)?.message ?? e).slice(0, 300);
    resolved = null;
  }
  stores.set(name, resolved);
  return resolved;
}

/* ── local file driver ── */

const fileFor = (key: string) =>
  path.join(process.cwd(), "data", `${key.replace(/[^a-z0-9-]/gi, "_")}.json`);

export function fsRead<T>(key: string): T | null {
  try {
    return JSON.parse(readFileSync(fileFor(key), "utf8")) as T;
  } catch {
    return null;
  }
}

function fsWrite(key: string, value: unknown): void {
  // Serverless filesystems are read-only, so reaching here in production
  // means the blob store couldn't be reached. Surface why.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "No writable store: Netlify Blobs is unavailable" +
        (lastStoreError ? ` (${lastStoreError})` : "") +
        ". This host has a read-only filesystem, so nothing can be saved. " +
        "Set NETLIFY_SITE_ID and NETLIFY_API_TOKEN if automatic blob context " +
        "isn't provided."
    );
  }
  mkdirSync(path.dirname(fileFor(key)), { recursive: true });
  writeFileSync(fileFor(key), JSON.stringify(value, null, 1));
}

/* ── single JSON documents (settings, admin auth) ── */

const KV = "kv";

export async function kvGet<T>(key: string): Promise<T | null> {
  const s = await store(KV);
  if (s) return ((await s.get(key, { type: "json" })) as T) ?? null;
  return fsRead<T>(key);
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const s = await store(KV);
  if (s) return void (await s.setJSON(key, value));
  fsWrite(key, value);
}

/* ── hash maps (orders by id, subscribers by email) ──
   Each hash is its own blob store, so a field is just a key inside it and
   listing the store is the whole map. */

export async function hashGetAll<T>(hash: string): Promise<Record<string, T>> {
  const s = await store(hash);
  if (s) {
    const { blobs } = await s.list();
    const map: Record<string, T> = {};
    // Blobs has no bulk read, so fan out — these sets are small (orders,
    // subscribers), and the alternative is one giant document that would
    // lose writes whenever two orders land at once.
    await Promise.all(
      blobs.map(async (b) => {
        const v = (await s.get(b.key, { type: "json" })) as T | null;
        if (v != null) map[b.key] = v;
      })
    );
    return map;
  }
  const raw = fsRead<unknown>(hash);
  if (Array.isArray(raw)) {
    // legacy array files (early dev data) — convert to a map
    const map: Record<string, T> = {};
    for (const item of raw as (T & { id?: string; email?: string })[]) {
      const k = item.id ?? item.email ?? String(Object.keys(map).length);
      map[k] = item;
    }
    return map;
  }
  return (raw as Record<string, T>) ?? {};
}

export async function hashSet(hash: string, field: string, value: unknown): Promise<void> {
  const s = await store(hash);
  if (s) return void (await s.setJSON(field, value));
  const map = await hashGetAll<unknown>(hash);
  map[field] = value;
  fsWrite(hash, map);
}

export async function hashDelete(hash: string, field: string): Promise<void> {
  const s = await store(hash);
  if (s) return void (await s.delete(field));
  const map = await hashGetAll<unknown>(hash);
  delete map[field];
  fsWrite(hash, map);
}

export async function hashHas(hash: string, field: string): Promise<boolean> {
  const s = await store(hash);
  if (s) return (await s.get(field, { type: "json" })) != null;
  const map = await hashGetAll<unknown>(hash);
  return field in map;
}

export async function hashCount(hash: string): Promise<number> {
  const s = await store(hash);
  if (s) return (await s.list()).blobs.length;
  return Object.keys(await hashGetAll<unknown>(hash)).length;
}

/** Round-trips a value through the real driver — used by /api/diag. */
export async function storageSelfTest(): Promise<{
  driver: string;
  ok: boolean;
  error?: string;
}> {
  const s = await store(KV);
  const driver = s ? "netlify-blobs" : "local-files";
  try {
    const key = "__diag__";
    const stamp = { at: new Date().toISOString() };
    await kvSet(key, stamp);
    const back = await kvGet<typeof stamp>(key);
    if (back?.at !== stamp.at) {
      return { driver, ok: false, error: "wrote a value but read back something else" };
    }
    return { driver, ok: true };
  } catch (e) {
    return {
      driver,
      ok: false,
      error: String((e as Error)?.message ?? e).slice(0, 300),
    };
  }
}
