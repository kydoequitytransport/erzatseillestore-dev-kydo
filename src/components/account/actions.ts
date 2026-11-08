"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

export async function signOutCustomer(locale: Locale) {
  const safeLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const cookieStore = await cookies();
  cookieStore.delete("shopify_customer_access_token");
  cookieStore.delete("shopify_customer_email");
  redirect(`/${safeLocale}/account/login`);
}
