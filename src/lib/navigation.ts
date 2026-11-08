import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getCollections, getMenu, shopifyConfig, type MenuItem } from "@/lib/shopify";

/**
 * The header mega menu. Comes from the Shopify menu `siteConfig.menus.main`; the bundled
 * default (`config/main-menu.json`) is used while that menu is empty or when running on
 * mock.shop, whose demo menu has no dropdown levels.
 */
export async function getMainMenu(locale: Locale): Promise<MenuItem[]> {
  if (shopifyConfig.isMockShop) {
    return (await getCollections(locale)).map((collection) => ({
      title: collection.title,
      path: `/collections/${collection.handle}`,
      items: [],
    }));
  }

  const menu = (await getMenu(locale, siteConfig.menus.main)).filter((item) => item.path !== "/");
  if (menu.length) return menu;

  return (await getCollections(locale)).map((collection) => ({
    title: collection.title,
    path: `/collections/${collection.handle}`,
    items: [],
  }));
}
