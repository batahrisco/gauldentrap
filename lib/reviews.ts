// Customer testimonials shown on the homepage — ported from the reference
// site so the "What people are saying" section clones as-is.
//
// NOTE: these came across with the design; they are not verified purchases on
// this store. Swap them for real reviews as they come in — publishing
// invented testimonials is what the FTC fake-review rule targets. Emptying
// this array hides the whole homepage section automatically.

export type Review = {
  name: string;
  rating: 5;
  text: string;
  meta?: string;
};

export const REVIEWS: Review[] = [
  {
    "name": "James K.",
    "rating": 5,
    "text": "Ordered for the first time last month and honestly wasn't sure what to expect. Package arrived in four days, completely plain box with nothing suspicious on the outside. Product quality was exceptional — the flower was fresh, well-cured and exactly as described. Will definitely be a returning customer.",
    "meta": "Verified Purchase · 3 weeks ago"
  },
  {
    "name": "Sarah M.",
    "rating": 5,
    "text": "I've tried several online dispensaries and this is by far the most professional experience. Customer support actually responded within an hour when I had a question about my order. The edibles I got were perfectly dosed — I finally found something that helps with my sleep without feeling groggy the next morning.",
    "meta": "Verified Purchase · 1 month ago"
  },
  {
    "name": "Ryan T.",
    "rating": 5,
    "text": "Shipping to the UK was faster than I expected — arrived in just under a week. The concentrate selection is unlike anything I've found locally, and the lab testing info gave me real confidence in what I was buying. Packaging was completely discreet, my neighbours would never know. Already placed a second order.",
    "meta": "Verified Purchase · 2 weeks ago"
  },
  {
    "name": "Aisha N.",
    "rating": 5,
    "text": "Was skeptical ordering internationally but the whole experience was seamless. The hash selection is incredible — quality I haven't seen since travelling abroad. Everything arrived vacuum sealed and completely odourless. The customer guarantee gave me peace of mind and I'm glad I took the chance. Highly recommend.",
    "meta": "Verified Purchase · 5 days ago"
  }
];

export function initialsOf(name: string): string {
  const parts = name.replace(/./g, "").trim().split(/s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export const averageRating =
  Math.round(
    (REVIEWS.reduce((n, r) => n + r.rating, 0) / Math.max(1, REVIEWS.length)) * 10
  ) / 10;
