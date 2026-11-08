import "server-only";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getCart, type Cart } from "@/lib/shopify";
import { CART_COOKIE } from "@/lib/shopify/config";

/** Reads the visitor's Shopify cart. Request-time only: render inside <Suspense>. */
export async function getCurrentCart(locale: Locale): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  try {
    return await getCart(locale, cartId);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to load cart", error);
    return null;
  }
}
