import type { Metadata } from "next";
import { Montserrat, Nunito_Sans } from "next/font/google";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-context";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { AnnouncementBar, TopBar } from "@/components/layout/top-bar";
import { siteConfig } from "@/config/site";
import { I18nProvider } from "@/i18n/client";
import { INTL_LOCALE, LOCALES, localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getCurrentCart } from "@/lib/cart";
import "../globals.css";

const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: siteConfig.name, template: `%s — ${siteConfig.name}` },
    description: dict.meta.description,
    alternates: {
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, "/")])),
        "x-default": "/",
      },
    },
    openGraph: { siteName: siteConfig.name, locale: INTL_LOCALE[locale].replace("-", "_"), type: "website" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, dict } = await getI18n();
  const cartPromise = getCurrentCart(locale);

  return (
    <html lang={INTL_LOCALE[locale]} className={`${nunito.variable} ${montserrat.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <I18nProvider locale={locale} dict={dict}>
          <CartProvider cartPromise={cartPromise}>
            <TopBar />
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
