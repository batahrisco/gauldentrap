// Shared between client (checkout/popup/newsletter/age gate) and server (orders API)
export const AGE_OK_KEY = "gt_age_ok";
export const DISCOUNT_STORAGE_KEY = "gt_discount_code";
export const OFFER_DONE_KEY = "gt_offer_done";
export const WELCOME_CODE = "WELCOME10";
export const WELCOME_RATE = 0.1;

export function discountFor(code: string | undefined | null, subtotal: number): number {
  if (!code || code.trim().toUpperCase() !== WELCOME_CODE) return 0;
  return Math.round(subtotal * WELCOME_RATE * 100) / 100;
}
