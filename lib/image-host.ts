// Product imagery can be served from jsDelivr's free CDN, which mirrors the
// public GitHub repo, instead of Netlify's metered bandwidth. Images are the
// overwhelming majority of what this site transfers, so pointing them at the
// CDN is the single biggest lever on the bandwidth bill.
//
// Set NEXT_PUBLIC_IMAGE_CDN to the jsDelivr base URL to enable it, or leave
// it empty to serve from the site (local dev does this automatically, so
// unpushed images still render).
//
// Requires the GitHub repo to be PUBLIC — jsDelivr can't read private repos.

const CDN = process.env.NEXT_PUBLIC_IMAGE_CDN ?? "";

/**
 * Every directory that ships inside the repo, so all of it can be offloaded:
 *   /images      201MB — the Meridian catalog photography (the bulk)
 *   /hero_images   4MB — category tiles and the about shot
 *   /products      2MB — nicotine range
 *   /sourced       5MB — nicotine range
 *
 * /uploads and /api/uploads are deliberately absent: admin-uploaded images
 * live in Netlify Blobs, not the repo, so the CDN has nothing to serve.
 */
const CDN_PREFIXES = ["/images/", "/hero_images/", "/products/", "/sourced/"];

/** Rewrites a repo-local image path to the CDN. Absolute URLs pass through. */
export function imageUrl(src: string): string {
  if (!CDN || !src.startsWith("/")) return src;
  if (!CDN_PREFIXES.some((p) => src.startsWith(p))) return src;
  return `${CDN}${src}`;
}
