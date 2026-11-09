import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import { createCartCheckoutUrl, getCartCheckoutUrl } from "@/lib/shopify";
import {
  CART_COOKIE,
  CHECKOUT_INTENT_COOKIE,
  CHECKOUT_QUANTITY_COOKIE,
  CHECKOUT_VARIANT_COOKIE,
} from "@/lib/shopify/config";

const INTENT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api",
  maxAge: 600,
} as const;

function clearCheckoutIntent(response: NextResponse) {
  for (const name of [CHECKOUT_INTENT_COOKIE, CHECKOUT_VARIANT_COOKIE, CHECKOUT_QUANTITY_COOKIE]) {
    response.cookies.set(name, "", { ...INTENT_COOKIE_OPTIONS, maxAge: 0 });
  }
}

function validVariantId(value: string | undefined): value is string {
  return !!value && value.length <= 512 && value.startsWith("gid://shopify/ProductVariant/");
}

function validQuantity(value: string | undefined): value is string {
  const quantity = Number(value);
  return !!value && Number.isInteger(quantity) && quantity > 0 && quantity <= 9999;
}

function cartUrl(request: NextRequest, locale: Locale, error = false) {
  const url = new URL(`/${locale}/cart`, request.url);
  if (error) url.searchParams.set("checkout", "error");
  return url;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requestedLocale = params.get("locale");
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const mode = params.get("mode") === "buy-now" ? "buy-now" : "cart";
  const cookieStore = await cookies();
  const variantId = params.get("variantId") ?? cookieStore.get(CHECKOUT_VARIANT_COOKIE)?.value;
  const quantity = params.get("quantity") ?? cookieStore.get(CHECKOUT_QUANTITY_COOKIE)?.value;
  const buyNowVariantId = validVariantId(variantId) ? variantId : null;
  const buyNowQuantity = validQuantity(quantity) ? Number(quantity) : null;

  if (mode === "buy-now" && (buyNowVariantId === null || buyNowQuantity === null)) {
    const response = NextResponse.redirect(cartUrl(request, locale));
    clearCheckoutIntent(response);
    return response;
  }

  const isSignedIn =
    !!cookieStore.get("shopify_customer_access_token")?.value &&
    !!cookieStore.get("shopify_customer_email")?.value;

  if (!isSignedIn) {
    const response = NextResponse.redirect(new URL(`/${locale}/account/login`, request.url));
    response.cookies.set(CHECKOUT_INTENT_COOKIE, mode, INTENT_COOKIE_OPTIONS);
    if (mode === "buy-now" && buyNowVariantId !== null && buyNowQuantity !== null) {
      response.cookies.set(CHECKOUT_VARIANT_COOKIE, buyNowVariantId, INTENT_COOKIE_OPTIONS);
      response.cookies.set(CHECKOUT_QUANTITY_COOKIE, String(buyNowQuantity), INTENT_COOKIE_OPTIONS);
    }
    return response;
  }

  try {
    let checkoutUrl: string | null;
    if (mode === "buy-now") {
      if (buyNowVariantId === null || buyNowQuantity === null) {
        const response = NextResponse.redirect(cartUrl(request, locale));
        clearCheckoutIntent(response);
        return response;
      }
      checkoutUrl = await createCartCheckoutUrl(locale, [
        { merchandiseId: buyNowVariantId, quantity: buyNowQuantity },
      ]);
    } else {
      checkoutUrl = await getCartCheckoutUrl(locale, cookieStore.get(CART_COOKIE)?.value ?? "");
    }

    if (!checkoutUrl) {
      const response = NextResponse.redirect(cartUrl(request, locale));
      clearCheckoutIntent(response);
      return response;
    }

    const destination = new URL(checkoutUrl);
    if (destination.protocol !== "https:") {
      throw new Error("Shopify returned an insecure checkout URL");
    }

    const response = NextResponse.redirect(destination);
    clearCheckoutIntent(response);
    return response;
  } catch (error) {
    console.error("Could not start Shopify checkout", error);
    const response = NextResponse.redirect(cartUrl(request, locale, true));
    clearCheckoutIntent(response);
    return response;
  }
}
