import type { Money } from "@/lib/shopify/types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const formatters = new Map<string, Intl.NumberFormat>();

/** @param intl BCP 47 locale, e.g. "de-CH" */
export function formatMoney({ amount, currencyCode }: Money, intl: string) {
  const key = `${intl}:${currencyCode}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intl, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "code",
    });
    formatters.set(key, formatter);
  }
  return formatter.format(Number(amount));
}

export function discountPercent(price: Money, compareAt: Money | null | undefined) {
  if (!compareAt) return 0;
  const p = Number(price.amount);
  const c = Number(compareAt.amount);
  if (!(c > p) || c === 0) return 0;
  return Math.round(((c - p) / c) * 100);
}

export function formatDate(iso: string, intl: string) {
  return new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}
