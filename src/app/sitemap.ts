import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { DEFAULT_LOCALE, LOCALES, localizePath } from "@/i18n/config";
import { getCollections, getProducts } from "@/lib/shopify";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, { products }] = await Promise.all([
    getCollections(DEFAULT_LOCALE, 250),
    getProducts({ locale: DEFAULT_LOCALE, first: 250, sortKey: "BEST_SELLING" }),
  ]);

  const paths = [
    "/",
    "/collections",
    ...collections.map((c) => `/collections/${c.handle}`),
    ...products.map((p) => `/products/${p.handle}`),
  ];

  return paths.map((path) => ({
    url: `${siteConfig.url}${path === "/" ? "" : path}`,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${siteConfig.url}${localizePath(l, path)}`])),
    },
  }));
}
