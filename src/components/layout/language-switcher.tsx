"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { isLocale, LOCALES, LOCALE_LABELS, localizePath, splitLocale, type Locale } from "@/i18n/config";

const LOCALE_FLAGS: Record<Locale, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  fr: "🇫🇷",
  it: "🇮🇹",
};

export function LanguageSwitcher() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (value: string) => {
    if (!isLocale(value)) return;
    const next: Locale = value;
    const { path } = splitLocale(pathname);
    router.push(localizePath(next, path) + window.location.search + window.location.hash);
  };

  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">{dict.topBar.language}</span>
      <select
        value={locale}
        onChange={(e) => switchTo(e.target.value)}
        aria-label={dict.topBar.language}
        className="cursor-pointer rounded-[3px] border border-line bg-white py-1 pr-1 pl-1.5 text-[12px] font-semibold uppercase outline-none hover:border-ink focus:border-brand"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_FLAGS[l]} {l.toUpperCase()} – {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Static placeholder shown while the pathname is resolved. */
export function LanguageSwitcherFallback({ locale }: { locale: Locale }) {
  return (
    <span className="rounded-[3px] border border-line px-1.5 py-1 text-[12px] font-semibold uppercase">
      {LOCALE_FLAGS[locale]} {locale}
    </span>
  );
}
