"use client";

import { useRef, useState } from "react";

const MAX_EDGE = 1600;
const QUALITY = 0.85;

/**
 * Downscales images in the browser before they're posted.
 *
 * Server Actions cap the request body at 1MB by default, and Netlify
 * Functions cap it at ~6MB — so a straight 4MB phone photo silently failed
 * the whole action. Resizing to 1600px/WebP here puts a typical product
 * shot at 150–400KB, comfortably under both, and is what gets stored.
 */
export default function ImagePicker({ name = "images" }: { name?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("");
  const [previews, setPreviews] = useState<{ url: string; kb: number }[]>([]);

  async function shrink(file: File): Promise<File> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    // already small enough and not a huge file — leave it alone
    if (scale === 1 && file.size < 900_000) return file;

    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/webp", QUALITY)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
      type: "image/webp",
    });
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = [...(e.target.files ?? [])];
    if (!picked.length) return;
    setStatus("Optimising…");

    const out = new DataTransfer();
    const shots: { url: string; kb: number }[] = [];
    let before = 0;
    let after = 0;
    for (const file of picked) {
      before += file.size;
      const small = await shrink(file);
      after += small.size;
      out.items.add(small);
      shots.push({ url: URL.createObjectURL(small), kb: Math.round(small.size / 1024) });
    }
    if (fileRef.current) fileRef.current.files = out.files;
    setPreviews(shots);
    setStatus(
      `${picked.length} image${picked.length === 1 ? "" : "s"} ready — ` +
        `${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(2)}MB`
    );
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={onPick}
        className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-ink"
      />
      {status && <p className="mt-2 text-xs font-semibold text-verify">{status}</p>}
      {previews.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {previews.map((p, i) => (
            <figure key={i} className="w-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt=""
                className="h-20 w-20 rounded-lg border border-line-2 object-cover"
              />
              <figcaption className="mt-1 text-center text-[10px] text-muted">
                {p.kb} KB
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-muted">
        First image is the main product shot. Anything larger than 1600px is
        resized automatically, so phone photos are fine.
      </p>
    </div>
  );
}
