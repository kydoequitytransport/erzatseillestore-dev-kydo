import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { splitLocale, type Locale } from "@/i18n/config";
import { shopifyFetch, ShopifyError } from "./client";
import { shopifyConfig, TAGS } from "./config";
import {
  ARTICLE_QUERY,
  ARTICLES_QUERY,
  BLOG_ARTICLES_QUERY,
  CART_CHECKOUT_URL_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  COLLECTION_QUERY,
  COLLECTIONS_QUERY,
  CUSTOMER_CREATE_MUTATION,
  MENU_QUERY,
  PAGE_QUERY,
  PREDICTIVE_SEARCH_QUERY,
  PRODUCT_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
  PRODUCTS_QUERY,
  productsByHandleQuery,
} from "./queries";
import type {
  Article,
  ArticleLink,
  ArticleWithSiblings,
  Cart,
  Collection,
  Connection,
  MenuItem,
  Page,
  PageInfo,
  PredictiveSearchResult,
  Product,
  ProductCard,
  ProductList,
  ShopifyCart,
} from "./types";

export * from "./types";

/* ----------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

const STOREFRONT_PATH = /^\/(collections|products|pages|blogs|search|cart)(\/|$)|^\/$/;

/**
 * Turns absolute Shopify menu URLs (optionally locale-prefixed, e.g. "/fr/collections/x")
 * into locale-neutral storefront paths. Links add the active locale when rendering.
 */
export function toStorefrontPath(url: string): string {
  try {
    const parsed = new URL(url, "https://placeholder.local");
    const path = splitLocale(parsed.pathname).path.replace(/\/collections\/all$/, "/search");
    if (STOREFRONT_PATH.test(path)) return `${path}${parsed.search}`;
    return url;
  } catch {
    return url;
  }
}

function reshapeMenu(items: { title: string; url: string; items?: unknown[] }[]): MenuItem[] {
  return items.map((item) => ({
    title: item.title,
    path: !item.url || item.url.endsWith("#") ? null : toStorefrontPath(item.url),
    items: reshapeMenu((item.items ?? []) as typeof items),
  }));
}

type WithoutDerived<T> = Omit<T, "hasOnlyDefaultVariant">;

function reshapeProduct<T extends { options: { optionValues: { name: string }[] }[] }>(
  product: T,
): T & { hasOnlyDefaultVariant: boolean } {
  const hasOnlyDefaultVariant = product.options.every((o) => o.optionValues.length <= 1);
  return { ...product, hasOnlyDefaultVariant };
}

function reshapeCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    totalQuantity: cart.totalQuantity,
    cost: cart.cost,
    lines: cart.lines.nodes,
  };
}

/* ----------------------------------------------------------------------------
 * Catalog (cached per locale, revalidated by Shopify webhooks via /api/revalidate)
 * ------------------------------------------------------------------------- */

export async function getMenu(locale: Locale, handle: string): Promise<MenuItem[]> {
  "use cache";
  cacheTag(TAGS.menus);
  cacheLife("hours");

  const data = await shopifyFetch<{ menu: { items: { title: string; url: string }[] } | null }>({
    query: MENU_QUERY,
    variables: { handle },
    locale,
  });
  return data.menu ? reshapeMenu(data.menu.items) : [];
}

export async function getCollections(locale: Locale, first = 250): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("hours");

  const data = await shopifyFetch<{ collections: Connection<Collection> }>({
    query: COLLECTIONS_QUERY,
    variables: { first },
    locale,
  });
  return data.collections.nodes.filter((c) => !c.handle.startsWith("hidden-"));
}

export async function getCollection(locale: Locale, handle: string): Promise<Collection | null> {
  "use cache";
  cacheTag(TAGS.collections, `collection-${handle}`);
  cacheLife("hours");

  const data = await shopifyFetch<{ collection: Collection | null }>({
    query: COLLECTION_QUERY,
    variables: { handle },
    locale,
  });
  return data.collection;
}

/** Cursor window: the `size` items after `after`, or the `size` items before `before`. */
function pageWindow(size: number, after?: string, before?: string) {
  return before ? { last: size, before } : { first: size, after };
}

export type ShopifyFilter = {
  id: string;
  label: string;
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN";
  values: { id: string; label: string; count: number; input: string }[];
};

export async function getCollectionProducts({
  locale,
  handle,
  first = 24,
  after,
  before,
  sortKey,
  reverse,
  filters = [],
}: {
  locale: Locale;
  handle: string;
  first?: number;
  after?: string;
  before?: string;
  sortKey?: string;
  reverse?: boolean;
  filters?: Record<string, unknown>[];
}): Promise<(ProductList & { filters: ShopifyFilter[] }) | null> {
  "use cache";
  cacheTag(TAGS.products, TAGS.collections, `collection-${handle}`);
  cacheLife("minutes");

  const data = await shopifyFetch<{
    collection: {
      products: Connection<WithoutDerived<ProductCard>> & { filters: ShopifyFilter[]; pageInfo: PageInfo };
    } | null;
  }>({
    query: COLLECTION_PRODUCTS_QUERY,
    variables: { handle, ...pageWindow(first, after, before), sortKey, reverse, filters },
    locale,
  });
  if (!data.collection) return null;
  const { nodes, pageInfo, filters: available } = data.collection.products;
  return { products: nodes.map(reshapeProduct), pageInfo, filters: available };
}

export async function getProducts({
  locale,
  first = 24,
  after,
  before,
  query,
  sortKey,
  reverse,
}: {
  locale: Locale;
  first?: number;
  after?: string;
  before?: string;
  query?: string;
  sortKey?: string;
  reverse?: boolean;
}): Promise<ProductList> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("minutes");

  const data = await shopifyFetch<{ products: Connection<WithoutDerived<ProductCard>> & { pageInfo: PageInfo } }>({
    query: PRODUCTS_QUERY,
    variables: { ...pageWindow(first, after, before), query, sortKey, reverse },
    locale,
  });
  return { products: data.products.nodes.map(reshapeProduct), pageInfo: data.products.pageInfo };
}

/** Products that currently have a compare-at price (i.e. are on sale). */
export async function getSaleProducts(locale: Locale, first = 12): Promise<ProductCard[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("minutes");

  const { products } = await getProducts({ locale, first: 100, sortKey: "BEST_SELLING" });
  return products
    .filter(
      (p) => Number(p.compareAtPriceRange.maxVariantPrice.amount) > Number(p.priceRange.minVariantPrice.amount),
    )
    .slice(0, first);
}

export async function getProduct(locale: Locale, handle: string): Promise<Product | null> {
  "use cache";
  cacheTag(TAGS.products, `product-${handle}`);
  cacheLife("minutes");

  const data = await shopifyFetch<{ product: WithoutDerived<Product> | null }>({
    query: PRODUCT_QUERY,
    variables: { handle },
    locale,
  });
  return data.product ? reshapeProduct(data.product) : null;
}

/** Products by handle, in the given order; unknown or unpublished handles are skipped. */
export async function getProductsByHandle(locale: Locale, handles: string[]): Promise<ProductCard[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("minutes");

  if (!handles.length) return [];
  const data = await shopifyFetch<Record<string, WithoutDerived<ProductCard> | null>>({
    query: productsByHandleQuery(handles.length),
    variables: Object.fromEntries(handles.map((h, i) => [`h${i}`, h])),
    locale,
  });
  return handles
    .map((_, i) => data[`p${i}`])
    .filter((p): p is WithoutDerived<ProductCard> => !!p)
    .map(reshapeProduct);
}

export async function getProductRecommendations(locale: Locale, productId: string): Promise<ProductCard[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("hours");

  const data = await shopifyFetch<{ productRecommendations: WithoutDerived<ProductCard>[] | null }>({
    query: PRODUCT_RECOMMENDATIONS_QUERY,
    variables: { productId },
    locale,
  });
  return (data.productRecommendations ?? []).map(reshapeProduct);
}

export async function predictiveSearch(locale: Locale, query: string, limit = 6): Promise<PredictiveSearchResult> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("minutes");

  const data = await shopifyFetch<{ predictiveSearch: PredictiveSearchResult | null }>({
    query: PREDICTIVE_SEARCH_QUERY,
    variables: { query, limit },
    locale,
  });
  return data.predictiveSearch ?? { products: [], collections: [], queries: [] };
}

export async function getArticles(locale: Locale, first = 3): Promise<Article[]> {
  "use cache";
  cacheTag(TAGS.content);
  cacheLife("hours");

  if (shopifyConfig.isMockShop) return (await getDemoNews(locale)).slice(0, first);

  const data = await shopifyFetch<{ articles: Connection<Article> }>({
    query: ARTICLES_QUERY,
    variables: { first },
    locale,
  });
  return data.articles.nodes;
}

export async function getBlogArticles({
  locale,
  handle,
  first = 24,
  after,
  before,
}: {
  locale: Locale;
  handle: string;
  first?: number;
  after?: string;
  before?: string;
}): Promise<{ title: string; articles: Article[]; pageInfo: PageInfo } | null> {
  "use cache";
  cacheTag(TAGS.content, `blog-${handle}`);
  cacheLife("minutes");

  if (shopifyConfig.isMockShop) {
    if (handle !== "news") return null;
    const articles = await getDemoNews(locale);
    return {
      title: { de: "Neuigkeiten", en: "News", fr: "Actualités", it: "Notizie" }[locale],
      articles: articles.slice(0, first),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: articles[0]?.id ?? null,
        endCursor: articles.at(-1)?.id ?? null,
      },
    };
  }

  const data = await shopifyFetch<{
    blog: {
      title: string;
      articles: Connection<Article> & { pageInfo: PageInfo };
    } | null;
  }>({
    query: BLOG_ARTICLES_QUERY,
    variables: {
      handle,
      ...(before ? { last: first, before } : { first, after }),
    },
    locale,
  });
  if (!data.blog) return null;
  return {
    title: data.blog.title,
    articles: data.blog.articles.nodes,
    pageInfo: data.blog.articles.pageInfo,
  };
}

export async function getArticle(
  locale: Locale,
  blog: string,
  handle: string,
): Promise<ArticleWithSiblings | null> {
  "use cache";
  cacheTag(TAGS.content);
  cacheLife("minutes");

  if (shopifyConfig.isMockShop) {
    if (blog !== "news") return null;
    const articles = await getDemoNews(locale);
    const index = articles.findIndex((article) => article.handle === handle);
    const article = articles[index];
    if (!article) return null;
    const link = (i: number) => ({ handle: articles[i].handle, title: articles[i].title });
    return {
      ...article,
      previous: index > 0 ? link(index - 1) : null,
      next: index < articles.length - 1 ? link(index + 1) : null,
    };
  }

  const data = await shopifyFetch<{
    blog: { articleByHandle: Article | null; articles: Connection<ArticleLink> } | null;
  }>({
    query: ARTICLE_QUERY,
    variables: { blog, handle },
    locale,
  });
  const article = data.blog?.articleByHandle;
  if (!article) return null;
  const list = data.blog?.articles.nodes ?? [];
  const i = list.findIndex((a) => a.handle === article.handle);
  return {
    ...article,
    previous: i > 0 ? list[i - 1] : null,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
  };
}

async function getDemoNews(locale: Locale): Promise<Article[]> {
  const { products } = await getProducts({ locale, first: 3, sortKey: "BEST_SELLING" });
  const articles: Pick<Article, "handle" | "title" | "excerpt" | "contentHtml" | "tags" | "authorV2">[] = [
    {
      handle: "create-a-calm-living-room",
      title: "How to create a calm, comfortable living room",
      excerpt: "Simple, practical ideas for making your living room feel more welcoming and restful.",
      contentHtml:
        "<p>A comfortable living room starts with the way you use it. Make space for conversation, choose seating that suits your daily routine, and keep the things you use most within easy reach.</p><h2>Start with a focal point</h2><p>Arrange seating around a natural centre such as a window, fireplace, or coffee table. Leave clear paths through the room so it feels open and easy to move around.</p><h2>Choose comfort that lasts</h2><p>Think about seat depth, fabric care, and how many people use the space. A few useful, well-chosen pieces can make a room feel more personal than filling every corner.</p>",
      tags: ["Living room", "Furniture"],
      authorV2: { name: "Store24 Editorial" },
    },
    {
      handle: "choosing-a-dining-table",
      title: "A practical guide to choosing a dining table",
      excerpt: "Measure your room, plan for everyday use, and find a table that works for gatherings too.",
      contentHtml:
        "<p>The right dining table should fit both the room and the way your household lives. Before choosing a shape or finish, measure the dining area and allow enough space to pull chairs out comfortably.</p><h2>Think about the room</h2><p>Round tables can make conversation feel relaxed, while rectangular tables can work well in longer rooms. Check the dimensions with chairs in place, not just the tabletop.</p><h2>Plan for everyday life</h2><p>Consider how easy the surface is to care for and whether you need extra seating for guests. A practical table can be a centrepiece without making the room difficult to use.</p>",
      tags: ["Dining", "Home"],
      authorV2: { name: "Store24 Editorial" },
    },
    {
      handle: "make-a-bedroom-work-better",
      title: "Small bedroom, better storage: simple ideas",
      excerpt: "Make a compact bedroom easier to use with a few thoughtful furniture and layout choices.",
      contentHtml:
        "<p>A small bedroom can still feel restful. Begin by keeping the route between the door, bed, and wardrobe clear, then look for storage that uses the space you already have.</p><h2>Use space intentionally</h2><p>Choose furniture sized for the room and avoid blocking natural light. Bedside storage, wall shelves, and under-bed space can help keep everyday items organised.</p><h2>Keep the room restful</h2><p>Store away items that do not need to be on display and leave some open space. A simple layout makes a compact room feel calmer and easier to maintain.</p>",
      tags: ["Bedroom", "Storage"],
      authorV2: { name: "Store24 Editorial" },
    },
  ];

  return articles.map((article, index) => ({
    id: `demo-news-${article.handle}`,
    ...article,
    publishedAt: new Date(Date.UTC(2026, 9, 20 - index * 7)).toISOString(),
    image: products[index]?.featuredImage ?? products[index]?.images.nodes[0] ?? null,
    blog: {
      handle: "news",
      title: { de: "Neuigkeiten", en: "News", fr: "Actualités", it: "Notizie" }[locale],
    },
    seo: { title: article.title, description: article.excerpt },
  }));
}

export async function getPage(locale: Locale, handle: string): Promise<Page | null> {
  "use cache";
  cacheTag(TAGS.content);
  cacheLife("hours");

  const data = await shopifyFetch<{ page: Page | null }>({ query: PAGE_QUERY, variables: { handle }, locale });
  return data.page;
}

/* ----------------------------------------------------------------------------
 * Cart (never cached, always read from Shopify)
 * ------------------------------------------------------------------------- */

type CartMutationResult = {
  cart: ShopifyCart | null;
  userErrors: { field: string[] | null; message: string }[];
};

function unwrapCartMutation(result: CartMutationResult): ShopifyCart {
  if (result.userErrors.length) {
    throw new ShopifyError(result.userErrors.map((e) => e.message).join("; "));
  }
  if (!result.cart) throw new ShopifyError("Shopify returned no cart");
  return result.cart;
}

export async function getCart(locale: Locale, cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: CART_QUERY,
    variables: { cartId },
    locale,
  });
  return data.cart ? reshapeCart(data.cart) : null;
}

export async function getCartCheckoutUrl(locale: Locale, cartId: string): Promise<string | null> {
  if (!cartId) return null;
  const data = await shopifyFetch<{ cart: { checkoutUrl: string } | null }>({
    query: CART_CHECKOUT_URL_QUERY,
    variables: { cartId },
    locale,
  });
  return data.cart?.checkoutUrl ?? null;
}

export type CartLineInput = { merchandiseId: string; quantity: number };

export async function createCart(locale: Locale, lines: CartLineInput[] = []): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: CartMutationResult }>({
    query: CART_CREATE_MUTATION,
    variables: { lines },
    locale,
  });
  return reshapeCart(unwrapCartMutation(data.cartCreate));
}

export async function createCartCheckoutUrl(locale: Locale, lines: CartLineInput[]): Promise<string> {
  const data = await shopifyFetch<{ cartCreate: CartMutationResult }>({
    query: CART_CREATE_MUTATION,
    variables: { lines },
    locale,
  });
  return unwrapCartMutation(data.cartCreate).checkoutUrl;
}

export async function addCartLines(locale: Locale, cartId: string, lines: CartLineInput[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: CartMutationResult }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
    locale,
  });
  return reshapeCart(unwrapCartMutation(data.cartLinesAdd));
}

export async function updateCartLines(
  locale: Locale,
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: CartMutationResult }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines },
    locale,
  });
  return reshapeCart(unwrapCartMutation(data.cartLinesUpdate));
}

export async function removeCartLines(locale: Locale, cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: CartMutationResult }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds },
    locale,
  });
  return reshapeCart(unwrapCartMutation(data.cartLinesRemove));
}

/* ----------------------------------------------------------------------------
 * Newsletter
 * ------------------------------------------------------------------------- */

export async function subscribeToNewsletter(locale: Locale, email: string): Promise<void> {
  const data = await shopifyFetch<{
    customerCreate: { customerUserErrors: { code: string; message: string }[] };
  }>({
    query: CUSTOMER_CREATE_MUTATION,
    variables: {
      input: { email, acceptsMarketing: true, password: crypto.randomUUID() + "Aa1!" },
    },
    locale,
  });
  const errors = data.customerCreate.customerUserErrors.filter((e) => e.code !== "TAKEN");
  if (errors.length) throw new ShopifyError(errors.map((e) => e.message).join("; "));
}

export { shopifyConfig };
