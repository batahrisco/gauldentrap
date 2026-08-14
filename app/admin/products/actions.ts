"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import {
  deleteCustomProduct,
  getCustomProduct,
  saveCustomProduct,
} from "@/lib/products-custom";
import { fieldsFor } from "@/lib/product-fields";
import { imageDimensions, uploadProductImage } from "@/lib/uploads";
import type { GroupKey } from "@/lib/catalog";

const GROUP_KEYS: GroupKey[] = [
  "flower", "edibles", "vapes", "concentrates", "hash", "prerolls",
  "shrooms", "cbd", "wholesale", "disposables", "pods", "pouches",
];

// Owner-written copy is plain text; convert line breaks to paragraphs so
// it renders in the same .desc styling as catalog descriptions.
function toHtml(text: string): string {
  const blocks = text.trim().split(/\n{2,}/).filter(Boolean);
  return blocks
    .map((b) => `<p>${b.replace(/\n/g, "<br>").replace(/</g, "&lt;")}</p>`)
    .join("\n");
}

export async function saveProductAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const idRaw = str("id");
  const id = idRaw ? Number(idRaw) : undefined;
  const name = str("name");
  const price = Number(str("price"));

  if (!name || !Number.isFinite(price) || price <= 0) {
    redirect(`/admin/products/${id ?? "new"}?error=required`);
  }

  const existing = id ? await getCustomProduct(id) : null;
  const images = [...(existing?.images ?? [])];

  // Remove images the owner unchecked
  const keep = formData.getAll("keepImage").map(String);
  const kept = existing ? images.filter((im) => keep.includes(im.src)) : images;
  const finalImages = existing ? kept : [];

  // New uploads
  try {
    for (const entry of formData.getAll("images")) {
      if (!(entry instanceof File) || entry.size === 0) continue;
      const buf = Buffer.from(await entry.arrayBuffer());
      const [width, height] = imageDimensions(buf);
      const src = await uploadProductImage(entry);
      finalImages.push({ src, alt: name, width, height });
    }
  } catch (e) {
    console.error("[admin] image upload failed:", e);
    redirect(`/admin/products/${id ?? "new"}?error=upload`);
  }

  if (finalImages.length === 0) {
    redirect(`/admin/products/${id ?? "new"}?error=image`);
  }

  const regularRaw = str("regular_price");
  const regular = regularRaw ? Number(regularRaw) : null;
  const group = GROUP_KEYS.includes(str("group") as GroupKey)
    ? (str("group") as GroupKey)
    : "flower";

  // Size rows arrive as parallel arrays; keep only complete, priced pairs
  const labels = formData.getAll("variantLabel").map((v) => String(v).trim());
  const prices = formData.getAll("variantPrice").map((v) => Number(String(v)));
  const variants = labels
    .map((label, i) => ({ label, price: prices[i] }))
    .filter((v) => v.label && Number.isFinite(v.price) && v.price > 0);

  const f = fieldsFor(group);

  await saveCustomProduct({
    id,
    name,
    // With sizes, the headline price is the cheapest option — otherwise the
    // card and the buy box would disagree.
    price: variants.length ? Math.min(...variants.map((v) => v.price)) : price,
    regular_price: Number.isFinite(regular as number) && regular ? regular : null,
    group,
    brand: str("brand"),
    categoryName: str("categoryName"),
    descriptionHtml: toHtml(str("description")),
    images: finalImages,
    in_stock: str("in_stock") === "on",
    // ignore anything the category doesn't use, so switching category can't
    // leave a stale strain or set of weights behind
    variants: f.variants ? variants : [],
    strain: f.strain ? str("strain") || null : null,
    grade: f.grade ? str("grade") || null : null,
  });

  revalidatePath("/", "layout");
  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = Number(String(formData.get("id") ?? ""));
  if (Number.isFinite(id)) await deleteCustomProduct(id);
  revalidatePath("/", "layout");
  redirect("/admin/products?deleted=1");
}
