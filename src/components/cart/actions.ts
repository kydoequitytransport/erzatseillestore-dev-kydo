"use server";

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import {
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
  type Cart,
} from "@/lib/shopify";
import { CART_COOKIE } from "@/lib/shopify/config";

export type CartActionResult = { cart: Cart | null; error?: string };

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 14,
} as const;

async function readCartId() {
  return (await cookies()).get(CART_COOKIE)?.value;
}

async function persistCartId(id: string) {
  (await cookies()).set(CART_COOKIE, id, COOKIE_OPTIONS);
}

function toError(error: unknown) {
  console.error(error);
  return error instanceof Error ? error.message : "Unknown error";
}

const safeLocale = (locale: unknown): Locale => (isLocale(locale) ? locale : DEFAULT_LOCALE);

export async function addToCart(locale: Locale, merchandiseId: string, quantity = 1): Promise<CartActionResult> {
  const lang = safeLocale(locale);
  if (typeof merchandiseId !== "string" || !merchandiseId || !Number.isInteger(quantity) || quantity < 1) {
    return { cart: null, error: "Invalid selection" };
  }

  try {
    const cartId = await readCartId();
    const existing = cartId ? await getCart(lang, cartId) : null;
    const lines = [{ merchandiseId, quantity }];

    if (existing) return { cart: await addCartLines(lang, existing.id, lines) };

    const cart = await createCart(lang, lines);
    await persistCartId(cart.id);
    return { cart };
  } catch (error) {
    return { cart: null, error: toError(error) };
  }
}

export async function updateLineQuantity(locale: Locale, lineId: string, quantity: number): Promise<CartActionResult> {
  const lang = safeLocale(locale);
  if (typeof lineId !== "string" || !Number.isInteger(quantity) || quantity < 0) {
    return { cart: null, error: "Invalid quantity" };
  }

  try {
    const cartId = await readCartId();
    if (!cartId) return { cart: null, error: "Cart not found" };

    const cart =
      quantity > 0
        ? await updateCartLines(lang, cartId, [{ id: lineId, quantity }])
        : await removeCartLines(lang, cartId, [lineId]);
    return { cart };
  } catch (error) {
    return { cart: null, error: toError(error) };
  }
}

/** Express checkout for a single variant: a separate cart, so the shopper's main cart stays untouched. */
export async function buyNow(
  locale: Locale,
  merchandiseId: string,
  quantity = 1,
): Promise<{ checkoutUrl: string | null; error?: string }> {
  if (typeof merchandiseId !== "string" || !merchandiseId || !Number.isInteger(quantity) || quantity < 1) {
    return { checkoutUrl: null, error: "Invalid selection" };
  }
  try {
    const cart = await createCart(safeLocale(locale), [{ merchandiseId, quantity }]);
    return { checkoutUrl: cart.checkoutUrl };
  } catch (error) {
    return { checkoutUrl: null, error: toError(error) };
  }
}

export async function removeLine(locale: Locale, lineId: string): Promise<CartActionResult> {
  return updateLineQuantity(locale, lineId, 0);
}
