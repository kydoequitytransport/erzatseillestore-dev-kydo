"use server";

import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { subscribeToNewsletter } from "@/lib/shopify";

export type NewsletterState = { status: "idle" | "success" | "invalid" | "error" };

export async function subscribe(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();
  const requested = formData.get("locale");
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: "invalid" };
  try {
    await subscribeToNewsletter(locale, email);
    return { status: "success" };
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return { status: "error" };
  }
}
