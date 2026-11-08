"use client";

import NextLink from "next/link";
import { createContext, use, useMemo, type ComponentProps } from "react";
import { format, INTL_LOCALE, localizePath, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/de";

type I18nValue = {
  locale: Locale;
  intl: string;
  dict: Dictionary;
  t: typeof format;
  href: (path: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      intl: INTL_LOCALE[locale],
      dict,
      t: format,
      href: (path) => localizePath(locale, path),
    }),
    [locale, dict],
  );
  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n() {
  const ctx = use(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

/** `next/link` that prefixes internal paths with the active locale. */
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { locale } = useI18n();
  const localized = typeof href === "string" ? localizePath(locale, href) : href;
  return <NextLink href={localized} {...props} />;
}
