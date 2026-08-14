import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The static policy/info pages ported from the reference build. Their
 * original markup (including inline styles) is kept verbatim in
 * content/pages.json — see the --bg/--ac/--tx aliases in globals.css that
 * those styles resolve against.
 *
 * This is first-party content shipped with the repo, not user input, so
 * rendering it as HTML is safe.
 */
export type StaticPage = { title: string; html: string };

let cache: Record<string, StaticPage> | null = null;

function load(): Record<string, StaticPage> {
  if (!cache) {
    try {
      cache = JSON.parse(
        readFileSync(path.join(process.cwd(), "content", "pages.json"), "utf8")
      ) as Record<string, StaticPage>;
    } catch (e) {
      console.error("[pages] content/pages.json unreadable:", e);
      cache = {};
    }
  }
  return cache;
}

export function getStaticPage(slug: string): StaticPage | undefined {
  return load()[slug];
}

export function staticPageSlugs(): string[] {
  return Object.keys(load());
}
