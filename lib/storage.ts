// Storage layer with two drivers:
//  - Netlify Blobs in production — no account, no keys, no schema; the
//    store is provisioned automatically for the site on deploy.
//  - Local JSON files under data/ otherwise — used in dev, zero setup.
// Server-only. Everything the app persists (orders, subscribers, settings,
// admin auth) is key-value, which is exactly what Blobs is.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Netlify sets NETLIFY=true inside builds and functions. Outside that
 * context getStore() has no credentials to work with, so dev falls through
 * to the filesystem driver below.
 */
const onNetlify = () => process.env.NETLIFY === "true";

type Store = {
  get(key: string, opts?: { type: "json" }): Promise<unknown>;
  setJSON(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string }): Promise<{ blobs: { key: string }[] }>;
};

const stores = new Map<string, Store>();
async function store(name: string): Promise<Store> {
  let s = stores.get(name);
  if (!s) {
    const { getStore } = await import("@netlify/blobs");
    s = getStore({ name, consistency: "strong" }) as unknown as Store;
    stores.set(name, s);
  }
  return s;
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
  // means we're not running on Netlify. Say so plainly rather than
  // surfacing a confusing EROFS from deep inside a write.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "No writable store: expected Netlify Blobs, but NETLIFY is not set. " +
        "This host has a read-only filesystem, so orders and settings " +
        "cannot be saved here."
    );
  }
  mkdirSync(path.dirname(fileFor(key)), { recursive: true });
  writeFileSync(fileFor(key), JSON.stringify(value, null, 1));
}

/* ── single JSON documents (settings, admin auth) ── */

const KV = "kv";

export async function kvGet<T>(key: string): Promise<T | null> {
  if (onNetlify()) {
    const s = await store(KV);
    return ((await s.get(key, { type: "json" })) as T) ?? null;
  }
  return fsRead<T>(key);
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  if (onNetlify()) {
    const s = await store(KV);
    await s.setJSON(key, value);
    return;
  }
  fsWrite(key, value);
}

/* ── hash maps (orders by id, subscribers by email) ──
   Each hash is its own blob store, so a field is just a key inside it and
   listing the store is the whole map. */

export async function hashGetAll<T>(hash: string): Promise<Record<string, T>> {
  if (onNetlify()) {
    const s = await store(hash);
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
  if (onNetlify()) {
    const s = await store(hash);
    await s.setJSON(field, value);
    return;
  }
  const map = await hashGetAll<unknown>(hash);
  map[field] = value;
  fsWrite(hash, map);
}

export async function hashDelete(hash: string, field: string): Promise<void> {
  if (onNetlify()) {
    const s = await store(hash);
    await s.delete(field);
    return;
  }
  const map = await hashGetAll<unknown>(hash);
  delete map[field];
  fsWrite(hash, map);
}

export async function hashHas(hash: string, field: string): Promise<boolean> {
  if (onNetlify()) {
    const s = await store(hash);
    return (await s.get(field, { type: "json" })) != null;
  }
  const map = await hashGetAll<unknown>(hash);
  return field in map;
}

export async function hashCount(hash: string): Promise<number> {
  if (onNetlify()) {
    const s = await store(hash);
    return (await s.list()).blobs.length;
  }
  return Object.keys(await hashGetAll<unknown>(hash)).length;
}
