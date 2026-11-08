import { Slideshow, type Slide } from "@/components/home/slideshow";
import {
  BlogPosts,
  CollectionList,
  FeaturedCollection,
  HighlightsBanner,
  PromoGrid,
  PromoMosaic,
} from "@/components/home/sections";
import { siteConfig } from "@/config/site";
import { format } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getBlogArticles, getCollections, getProducts, getSaleProducts, type Collection } from "@/lib/shopify";

/** Picks the configured collections in order, or falls back to the first `count` with an image. */
function pick(all: Collection[], handles: readonly string[], count: number, offset = 0) {
  if (handles.length) {
    return handles.map((h) => all.find((c) => c.handle === h)).filter((c): c is Collection => !!c);
  }
  const withImage = all.filter((c) => c.image);
  if (!withImage.length) return [];
  return Array.from({ length: Math.min(count, withImage.length) }, (_, i) => withImage[(i + offset) % withImage.length]);
}

export default async function HomePage() {
  const { locale, dict } = await getI18n();
  const [collections, saleProducts, newest, news] = await Promise.all([
    getCollections(locale),
    getSaleProducts(locale, 12),
    getProducts({ locale, first: 12, sortKey: "CREATED_AT", reverse: true }),
    getBlogArticles({ locale, handle: "news", first: 3 }),
  ]);
  const { home } = siteConfig;

  const offers = saleProducts.length
    ? saleProducts
    : (await getProducts({ locale, first: 12, sortKey: "BEST_SELLING" })).products;

  const slides: Slide[] = pick(collections, home.slideshow, 4).map((c) => ({
    title: c.title,
    text: c.description,
    href: `/collections/${c.handle}`,
    cta: dict.home.shopNow,
    image: c.image ? { url: c.image.url, alt: c.image.altText ?? c.title } : null,
  }));

  return (
    <>
      <Slideshow slides={slides} />
      <HighlightsBanner />
      <PromoMosaic collections={pick(collections, home.mosaic, 2, 1)} />
      <CollectionList
        title={dict.home.ourCategories}
        collections={
          home.featuredCategories.length ? pick(collections, home.featuredCategories, 10) : collections.slice(0, 10)
        }
      />
      <BlogPosts title={format(dict.home.news, { name: siteConfig.name })} articles={news?.articles ?? []} />
      <FeaturedCollection
        title={dict.home.offers}
        subtitle={saleProducts.length ? dict.home.latestOffers : dict.home.popularProducts}
        href="/search?sort=best-selling"
        products={offers}
      />
      <FeaturedCollection
        title={dict.home.newArrivals}
        subtitle={dict.home.newArrivals}
        href="/search?sort=created-descending"
        products={newest.products}
      />
      <PromoGrid collections={pick(collections, home.promoGrid, 4, 2)} />
    </>
  );
}
