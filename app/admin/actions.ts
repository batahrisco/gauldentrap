"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  adminToken,
  isAdmin,
  passwordMatches,
  setAdminPassword,
} from "@/lib/admin";
import {
  PAYMENT_METHOD_KEYS,
  SOCIAL_KEYS,
  getSettings,
  saveSettings,
  type ChatSide,
  type PaymentMethodKey,
  type SocialKey,
} from "@/lib/settings";
import { updateOrderStatus, type OrderStatus } from "@/lib/orders";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!(await passwordMatches(password))) {
    redirect("/admin/login?error=1");
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function saveSettingsAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const current = await getSettings();
  const str = (k: string) => String(formData.get(k) ?? "").trim();
  // An unchecked checkbox sends no field at all, so absence means "off".
  const on = (k: string) => formData.get(k) != null;

  const side = str("chatSide");
  const chatSide: ChatSide =
    side === "telegram" || side === "none" ? side : "whatsapp";

  await saveSettings({
    whatsapp: str("whatsapp"),
    telegram: str("telegram"),
    chatSide,
    livechatEmbed: str("livechatEmbed"),
    notifyEmail: str("notifyEmail"),
    replyTo: str("replyTo"),
    socials: SOCIAL_KEYS.reduce(
      (acc, key) => ({ ...acc, [key]: str(key) }),
      { ...current.socials }
    ) as Record<SocialKey, string>,
    payments: {
      mode: str("paymentMode") === "direct" ? "direct" : "manual",
      enabled: PAYMENT_METHOD_KEYS.reduce(
        (acc, key) => ({ ...acc, [key]: on(`enabled_${key}`) }),
        {}
      ) as Record<PaymentMethodKey, boolean>,
      methods: PAYMENT_METHOD_KEYS.reduce(
        (acc, key) => ({ ...acc, [key]: str(`method_${key}`) }),
        { ...current.payments.methods }
      ) as Record<PaymentMethodKey, string>,
      otherLabel: str("otherLabel"),
    },
  });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function changePasswordAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!(await passwordMatches(current))) redirect("/admin/settings?pwerr=wrong");
  if (next.length < 8) redirect("/admin/settings?pwerr=short");
  if (next !== confirm) redirect("/admin/settings?pwerr=match");

  await setAdminPassword(next);
  // Token rotated — refresh this session's cookie so the admin stays in
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin/settings?pwsaved=1");
}

export async function setOrderStatusAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "new") as OrderStatus;
  await updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}
