/**
 * Which extra fields each category uses — pure config, no filesystem, so the
 * admin form (a client component) can import it. lib/products-custom.ts
 * re-exports these for server code.
 *
 * Measured from the shipped catalog: 213/222 flower carry weights, 202 carry
 * a strain and 88 a grade; hash, shrooms, concentrates and wholesale carry
 * weights only; everything else is a single price.
 */
export type GroupFields = {
  variants: boolean;
  strain: boolean;
  grade: boolean;
  presets: string[];
};

export const GROUP_FIELDS: Record<string, GroupFields> = {
  flower:       { variants: true,  strain: true,  grade: true,  presets: ["3.5g", "7g", "14g", "28g"] },
  hash:         { variants: true,  strain: false, grade: false, presets: ["1g", "3.5g", "7g", "14g", "28g"] },
  shrooms:      { variants: true,  strain: false, grade: false, presets: ["3.5g", "7g", "14g", "28g"] },
  concentrates: { variants: true,  strain: true,  grade: false, presets: ["1g", "2g", "3.5g", "7g"] },
  wholesale:    { variants: true,  strain: false, grade: true,  presets: ["QP (112g)", "HP (224g)", "P (448g)"] },
};

export const SIMPLE_FIELDS: GroupFields = {
  variants: false,
  strain: false,
  grade: false,
  presets: [],
};

export function fieldsFor(group: string): GroupFields {
  return GROUP_FIELDS[group] ?? SIMPLE_FIELDS;
}

export const STRAINS = ["Indica", "Sativa", "Hybrid"];
export const GRADES = ["AA", "AAA", "AAA+", "AAAA", "AAAA+"];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}
