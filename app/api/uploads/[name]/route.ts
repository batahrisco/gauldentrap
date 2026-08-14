import { uploadStore } from "@/lib/uploads";

/**
 * Serves admin-uploaded product images out of Netlify Blobs. Blobs have no
 * public URL of their own, so this route is what the storefront's <img>
 * points at. Cached hard — upload names are random and never reused.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // Names are generated server-side as [a-z0-9]+.ext; reject anything else
  // rather than letting a crafted key reach the store.
  if (!/^[a-z0-9-]+\.(jpg|png|webp|avif|gif)$/i.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const store = await uploadStore();
    if (!store) return new Response("Not found", { status: 404 });
    const blob = await store.getWithMetadata(name, { type: "arrayBuffer" });
    if (!blob) return new Response("Not found", { status: 404 });

    const contentType =
      (blob.metadata?.contentType as string | undefined) ?? "application/octet-stream";
    return new Response(blob.data as ArrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    // Outside Netlify (local dev) uploads land in public/uploads and are
    // served statically, so this route should never be hit there.
    console.error("[uploads] blob read failed:", e);
    return new Response("Not found", { status: 404 });
  }
}
