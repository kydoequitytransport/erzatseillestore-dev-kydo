import "server-only";
import type { Locale } from "@/i18n/config";
import { shopifyConfig } from "./config";

type GraphQLError = { message: string; path?: string[] };

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly errors?: GraphQLError[],
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

/**
 * Adds the buyer context so prices, availability and translations
 * (Shopify "Translate & Adapt") match the market and language.
 */
function withContext(query: string, locale: Locale) {
  const language = locale.toUpperCase();
  return query.replace(
    /^(\s*)(query|mutation)(\s+\w+)?(\s*\([^)]*\))?/,
    (_m, ws, op, name = "", vars = "") =>
      `${ws}${op}${name}${vars} @inContext(country: ${shopifyConfig.country}, language: ${language})`,
  );
}

export async function shopifyFetch<T>({
  query,
  variables,
  locale,
}: {
  query: string;
  variables?: Record<string, unknown>;
  locale: Locale;
}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (shopifyConfig.accessToken) {
    headers["X-Shopify-Storefront-Access-Token"] = shopifyConfig.accessToken;
  }

  const res = await fetch(shopifyConfig.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: withContext(query, locale), variables }),
  });

  if (!res.ok) {
    throw new ShopifyError(`Shopify request failed: ${res.status} ${res.statusText}`, res.status);
  }

  const body = (await res.json()) as { data?: T; errors?: GraphQLError[] };
  if (body.errors?.length) {
    throw new ShopifyError(body.errors.map((e) => e.message).join("; "), res.status, body.errors);
  }
  if (!body.data) {
    throw new ShopifyError("Shopify response contained no data", res.status);
  }
  return body.data;
}
