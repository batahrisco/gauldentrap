// Store sells worldwide out of USD — prices are stored and charged in USD.
const num = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "";
  return `$${num.format(value)}`;
}

export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  if (min == null) return "";
  if (max == null || max === min) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}
