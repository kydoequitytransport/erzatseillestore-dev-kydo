import { locale as localeParam } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import de from "./dictionaries/de";
import en from "./dictionaries/en";
import fr from "./dictionaries/fr";
import it from "./dictionaries/it";

const dictionaries = { de, en, fr, it };

/** Current locale from the `[locale]` root segment. Server Components only. */
export async function getLocale(): Promise<Locale> {
  const value = await localeParam();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDictionaryFor(locale: Locale) {
  return dictionaries[locale];
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, dict: dictionaries[locale] };
}
