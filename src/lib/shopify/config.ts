const domain = (process.env.SHOPIFY_STORE_DOMAIN || "furniture.mock.shop")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

const isMockShop = domain.endsWith("mock.shop");
const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-07";

export const shopifyConfig = {
  domain,
  isMockShop,
  endpoint: isMockShop ? `https://${domain}/api` : `https://${domain}/api/${apiVersion}/graphql.json`,
  accessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
  customerAccountUrl: process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL || "",
  country: (process.env.SHOPIFY_COUNTRY || "CH").toUpperCase(),
};

export const TAGS = {
  products: "shopify-products",
  collections: "shopify-collections",
  menus: "shopify-menus",
  content: "shopify-content",
} as const;

export const CART_COOKIE = "cartId";
