import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Server Actions default to a 1MB body, which silently killed the admin
    // product form the moment a real photo was attached. Images are already
    // downscaled client-side (components/admin/ImagePicker.tsx); this is the
    // headroom for a few of them at once, and stays under Netlify Functions'
    // own ~6MB request cap.
    serverActions: { bodySizeLimit: "5mb" },
  },
  // The JSON the app reads at runtime has to ship inside each Netlify
  // Function bundle. All of it is read through readFileSync(process.cwd() + …),
  // which the tracer can't follow, so every file is listed by hand — miss one
  // and that data silently reads as empty in production.
  outputFileTracingIncludes: {
    "/**": ["./catalog/products.json", "./data/site-settings.json"],
  },
  // Product imagery is content-addressed by slug and never mutated in
  // place, so it can be cached hard. Without this the CDN revalidates
  // constantly and every visitor re-downloads the whole image set.
  async headers() {
    return [
      {
        // every image directory, or the uncovered ones revalidate on each
        // visit — /images alone is 201MB of product photography
        source: "/:dir(images|hero_images|products|sourced)/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    // Every product image is pre-optimised to webp at source time, so we
    // serve them as plain static files rather than paying for an optimiser.
    unoptimized: true,
    remotePatterns: [
      // optional free CDN mirror of the public GitHub repo, set via
      // NEXT_PUBLIC_IMAGE_CDN — keeps imagery off Netlify's bandwidth
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/**",
      },
    ],
  },
};

export default nextConfig;
