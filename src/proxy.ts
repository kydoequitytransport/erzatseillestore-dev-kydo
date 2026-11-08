import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, splitLocale } from "@/i18n/config";

/**
 * Locale routing like the original shop: German lives at "/", the other
 * languages under "/en", "/fr" and "/it". Unprefixed requests are rewritten
 * to the internal "/de" segment; explicit "/de/..." URLs redirect to the
 * canonical unprefixed URL.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { locale, path } = splitLocale(pathname);
  const hasPrefix = pathname === `/${locale}` || pathname.startsWith(`/${locale}/`);

  if (hasPrefix && locale === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url, 308);
  }

  if (!hasPrefix) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|robots.txt|sitemap.xml|favicon.ico|.*\\..*).*)"],
};
