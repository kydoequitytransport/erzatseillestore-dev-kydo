import { Suspense } from "react";
import { FlagIcon, PhoneIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n/server";
import { LanguageSwitcher, LanguageSwitcherFallback } from "./language-switcher";

export async function TopBar() {
  const { locale, dict } = await getI18n();
  const { phone } = siteConfig;
  return (
    <div className="border-b border-line bg-white text-[13px]">
      <div className="container-site flex items-center justify-between gap-4 py-2">
        <p className="flex min-w-0 items-center gap-1.5">
          <PhoneIcon className="size-4 shrink-0 text-brand" />
          <span className="hidden sm:inline">{dict.topBar.support} |</span>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="truncate font-semibold hover:text-brand">
            {phone}
          </a>
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <p className="hidden items-center gap-1.5 font-semibold sm:flex">
            <FlagIcon />
            {dict.topBar.swissCompany}
          </p>
          <Suspense fallback={<LanguageSwitcherFallback locale={locale} />}>
            <LanguageSwitcher />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export async function AnnouncementBar() {
  const { dict } = await getI18n();
  return (
    <div className="bg-brand py-3 text-center text-[13px] font-bold leading-tight text-black md:py-3.5">
      <div className="container-site">{dict.topBar.announcement}</div>
    </div>
  );
}
