import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { parseListingParams } from "@/components/listing/listing-params";
import { ListingSkeleton, ProductListing } from "@/components/listing/product-listing";
import { format } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { PAGE_SIZE } from "@/lib/constants";
import { getProducts } from "@/lib/shopify";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.meta.search, robots: { index: false } };
}

async function SearchResults({ searchParams }: Pick<PageProps<"/[locale]/search">, "searchParams">) {
  const { locale, dict } = await getI18n();
  const state = parseListingParams(await searchParams);
  const sortKey = state.q || state.sort.productKey !== "RELEVANCE" ? state.sort.productKey : "BEST_SELLING";
  const { products, pageInfo } = await getProducts({
    locale,
    first: PAGE_SIZE,
    after: state.after,
    before: state.before,
    query: state.q || undefined,
    sortKey,
    reverse: state.sort.reverse,
  });

  return (
    <>
      <Breadcrumbs items={[{ label: state.q ? dict.meta.search : dict.search.allProducts }]} />
      <h1 className="mb-6 text-[28px] leading-tight md:text-4xl">
        {state.q ? format(dict.search.resultsFor, { q: state.q }) : dict.search.allProducts}
      </h1>
      <ProductListing
        basePath="/search"
        state={state}
        products={products}
        pageInfo={pageInfo}
        emptyText={state.q ? format(dict.search.noResultsFor, { q: state.q }) : undefined}
      />
    </>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/[locale]/search">) {
  return (
    <div className="container-site py-6 md:py-8">
      <Suspense fallback={<ListingSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
