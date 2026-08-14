"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { hasRange, primaryImage, priceFrom, type Product } from "@/lib/product";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";

// Strain pills carry the reference build's colour coding — shoppers scan on
// this before they read the name.
const STRAIN_STYLE: Record<string, string> = {
  Indica: "bg-[#431478]/85 text-[#d8b4fe]",
  Sativa: "bg-[#9a3412]/85 text-[#fed7aa]",
  Hybrid: "bg-[#115e59]/85 text-[#99f6e4]",
};

export default function ProductCard({
  product,
  badge,
}: {
  product: Product;
  badge?: string;
}) {
  const router = useRouter();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const img = primaryImage(product);
  const ranged = hasRange(product);
  const from = priceFrom(product);

  // Card body navigates; the Add button adds at the base price without
  // leaving the grid — same behaviour as the reference build.
  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: from,
      image: img?.src ?? null,
      variant: product.variants[0]?.label ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div
      onClick={() => router.push(`/product/${product.slug}`)}
      className="group cursor-pointer overflow-hidden rounded-[10px] border border-line bg-surface transition-all duration-200 hover:-translate-y-[3px] hover:border-verify hover:shadow-[0_12px_40px_rgba(0,0,0,.6),0_0_0_1px_rgba(45,212,191,.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#111]">
        {img && (
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {product.strain && (
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide ${
              STRAIN_STYLE[product.strain] ?? "bg-black/70 text-white"
            }`}
          >
            {product.strain}
          </span>
        )}
        {(badge || product.grade) && (
          <span className="absolute left-2 top-2 rounded bg-[#134e4a] px-[7px] py-[3px] text-[9px] font-extrabold uppercase tracking-widest text-[#99f6e4]">
            {badge ?? product.grade}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-black/80 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-[13px]">
        <p className="line-clamp-2 min-h-[2.4em] text-[13px] font-semibold leading-snug transition group-hover:text-accent">
          {product.name}
        </p>
        <p className="mt-1 truncate text-[10.5px] text-muted">{product.category}</p>
        <p className="mt-1.5 text-[10px] tracking-[1px] text-[#fbbf24]">★★★★★</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[15px] font-bold">
            {ranged && (
              <span className="mr-1 text-[10px] font-normal text-muted">from</span>
            )}
            {formatPrice(from)}
          </span>
          {product.inStock && (
            <button
              onClick={handleAdd}
              className="whitespace-nowrap rounded-[7px] bg-accent px-3 py-[7px] text-[10px] font-extrabold uppercase tracking-wide text-ink transition hover:bg-accent-2"
            >
              {added ? "Added ✓" : "+ Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
