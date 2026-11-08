import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { parseListingParams } from "@/components/listing/listing-params";
import { ListingSkeleton, ProductListing } from "@/components/listing/product-listing";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { LOCALES, localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { PAGE_SIZE } from "@/lib/constants";
import { getCollection, getCollectionProducts } from "@/lib/shopify";

type Props = PageProps<"/[locale]/collections/[handle]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await getI18n();
  const { handle } = await params;
  const collection = await getCollection(locale, handle);
  if (!collection) return {};
  const path = `/collections/${handle}`;
  return {
    title: collection.seo.title || collection.title,
    description: collection.seo.description || collection.description,
    alternates: {
      canonical: localizePath(locale, path),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, path)])),
    },
    openGraph: collection.image ? { images: [collection.image.url] } : undefined,
  };
}

async function CollectionView({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const { locale, dict } = await getI18n();
  const [{ handle }, raw] = await Promise.all([params, searchParams]);
  const state = parseListingParams(raw);

  const [collection, listing] = await Promise.all([
    getCollection(locale, handle),
    getCollectionProducts({
      locale,
      handle,
      first: PAGE_SIZE,
      after: state.after,
      before: state.before,
      sortKey: state.sort.collectionKey,
      reverse: state.sort.reverse,
      filters: state.filters,
    }),
  ]);
  if (!collection || !listing) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: dict.listing.categories, href: "/collections" }, { label: collection.title }]} />

      <header className="mb-6 md:mb-8">
        <h1 className="mb-3 text-[28px] leading-tight font-bold md:text-[34px]">{collection.title}</h1>
        {collection.descriptionHtml && (
          <div className="rte" dangerouslySetInnerHTML={{ __html: collection.descriptionHtml }} />
        )}
      </header>

      <ProductListing
        basePath={`/collections/${handle}`}
        state={state}
        products={listing.products}
        pageInfo={listing.pageInfo}
        filters={listing.filters}
        emptyText={dict.listing.noProductsInCollection}
      />
    </>
  );
}

export default function CollectionPage({ params, searchParams }: Props) {
  return (
    <>
      <div className="container-site py-4 md:py-6">
        <Suspense fallback={<ListingSkeleton />}>
          <CollectionView params={params} searchParams={searchParams} />
        </Suspense>
      </div>
      <RecentlyViewed />
    </>
  );
}
