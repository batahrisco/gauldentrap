// Product image uploads from the admin dashboard.
//  - Netlify Blobs store "product-images" in production.
//  - public/uploads/ locally, so dev works with no cloud setup.
// Blobs have no public URL of their own, so uploads are served back through
// /api/uploads/<name> — see app/api/uploads/[name]/route.ts.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export const UPLOAD_STORE = "product-images";

const onNetlify = () => process.env.NETLIFY === "true";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

export async function uploadProductImage(file: File): Promise<string> {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) throw new Error(`Unsupported image type: ${file.type || "unknown"}`);
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Image too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024}MB)`);
  }

  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (onNetlify()) {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: UPLOAD_STORE, consistency: "strong" });
    // Blobs takes an ArrayBuffer, not a Node Buffer
    await store.set(name, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, {
      metadata: { contentType: file.type },
    });
    return `/api/uploads/${name}`;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

// Rough dimensions so custom products play by the same quality rules as
// the scraped catalog (hero needs >=700px). PNG/JPEG/WebP headers only.
export function imageDimensions(buf: Buffer): [number, number] {
  if (buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  if (
    buf.subarray(0, 4).toString() === "RIFF" &&
    buf.subarray(8, 12).toString() === "WEBP"
  ) {
    const t = buf.subarray(12, 16).toString();
    if (t === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    if (t === "VP8L") {
      const n = buf.readUInt32LE(21);
      return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1];
    }
    if (t === "VP8X") return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  }
  return [1000, 1000]; // unknown — assume usable
}
