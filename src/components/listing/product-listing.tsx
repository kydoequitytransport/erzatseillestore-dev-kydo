import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { Link } from "@/i18n/client";
import { format, localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { ProductGrid } from "@/components/product/product-card";
import { SORT_OPTIONS } from "@/lib/constants";
import type { ShopifyFilter } from "@/lib/shopify";
import type { PageInfo, ProductCard } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { listingHref, type ListingState } from "./listing-params";
import { SortSelect } from "./sort-select";

async function FilterSidebar({
  basePath,
  state,
  filters,
}: {
  basePath: string;
  state: ListingState;
  filters: ShopifyFilter[];
}) {
  const { locale, dict } = await getI18n();
  const visible = filters.filter((f) => f.type !== "PRICE_RANGE" && f.values.length > 0);
  const hasPrice = filters.some((f) => f.type === "PRICE_RANGE");
  const active = state.filterInputs.length > 0 || state.price.min !== undefined || state.price.max !== undefined;

  if (!visible.length && !hasPrice) return null;

  return (
    <aside className="space-y-6 lg:w-60 lg:shrink-0">
      <h2 className="border-b border-line pb-3 text-lg font-bold">{dict.listing.filter}</h2>
      {active && (
        <Link
          href={listingHref(basePath, state, { filterInputs: [], price: {} })}
          className="link-underline text-sm font-bold"
        >
          {dict.listing.resetFilters}
        </Link>
      )}

      {visible.map((filter) => (
        <details key={filter.id} open className="border-b border-line pb-4">
          <summary className="mb-3 cursor-pointer list-none font-heading text-base font-semibold">
            {filter.label}
          </summary>
          <ul className="space-y-2">
            {filter.values.map((value) => {
              const selected = state.filterInputs.includes(value.input);
              const next = selected
                ? state.filterInputs.filter((f) => f !== value.input)
                : [...state.filterInputs, value.input];
              return (
                <li key={value.id}>
                  <Link
                    href={listingHref(basePath, state, { filterInputs: next })}
                    scroll={false}
                    aria-current={selected || undefined}
                    className={cn(
                      "flex items-center gap-2.5 text-sm hover:text-brand",
                      value.count === 0 && !selected && "pointer-events-none opacity-40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[2px] border",
                        selected ? "border-brand bg-brand text-white" : "border-neutral-400",
                      )}
                    >
                      {selected && <CheckIcon className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="flex-1">{value.label}</span>
                    <span className="text-muted">({value.count})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      ))}

      {hasPrice && (
        <form method="get" action={localizePath(locale, basePath)} className="border-b border-line pb-4">
          <p className="mb-3 font-heading text-base font-semibold">{dict.listing.price}</p>
          {state.q && <input type="hidden" name="q" value={state.q} />}
          {state.sort.slug && <input type="hidden" name="sort" value={state.sort.slug} />}
          {state.filterInputs.map((f) => (
            <input key={f} type="hidden" name="filter" value={f} />
          ))}
          <div className="mb-3 flex items-center gap-2">
            <input
              type="number"
              name="price_min"
              min={0}
              defaultValue={state.price.min}
              placeholder={dict.listing.priceFrom}
              aria-label={`${dict.listing.price} ${dict.listing.priceFrom}`}
              className="input h-10"
            />
            <span>–</span>
            <input
              type="number"
              name="price_max"
              min={0}
              defaultValue={state.price.max}
              placeholder={dict.listing.priceTo}
              aria-label={`${dict.listing.price} ${dict.listing.priceTo}`}
              className="input h-10"
            />
          </div>
          <button type="submit" className="btn-secondary w-full py-2">
            {dict.listing.apply}
          </button>
        </form>
      )}
    </aside>
  );
}

export async function ProductListing({
  basePath,
  state,
  products,
  pageInfo,
  filters = [],
  emptyText,
}: {
  basePath: string;
  state: ListingState;
  products: ProductCard[];
  pageInfo: PageInfo;
  filters?: ShopifyFilter[];
  emptyText?: string;
}) {
  const { dict } = await getI18n();
  const sortHrefs = Object.fromEntries(
    SORT_OPTIONS.map((o) => [o.slug ?? "", listingHref(basePath, state, { sort: o.slug })]),
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <FilterSidebar basePath={basePath} state={state} filters={filters} />

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between gap-4 rounded-[3px] border border-line px-3 py-2">
          <SortSelect value={state.sort.slug} hrefs={sortHrefs} />
          <p className="text-sm text-muted">
            {format(products.length === 1 ? dict.listing.product : dict.listing.products, { n: products.length })}
            {(pageInfo.hasNextPage || pageInfo.hasPreviousPage) && ` ${dict.listing.onThisPage}`}
          </p>
        </div>

        {products.length ? (
          <ProductGrid products={products} className="xl:grid-cols-4 2xl:grid-cols-4" />
        ) : (
          <p className="py-16 text-center text-muted">{emptyText ?? dict.listing.noProducts}</p>
        )}

        {(pageInfo.hasPreviousPage || pageInfo.hasNextPage) && (
          <nav
            aria-label={dict.listing.pagination}
            className="mt-8 flex items-center justify-end gap-2 text-sm"
          >
            {pageInfo.hasPreviousPage && pageInfo.startCursor && (
              <Link
                href={listingHref(basePath, state, { before: pageInfo.startCursor, page: state.page - 1 })}
                className="flex h-10 items-center gap-1 rounded-[3px] border border-line px-3 hover:border-ink"
              >
                <ChevronLeftIcon className="size-4" />
                {dict.listing.previousPage}
              </Link>
            )}
            <span aria-current="page" className="flex h-10 items-center rounded-[3px] bg-brand px-4 font-bold text-white">
              {format(dict.listing.page, { n: state.page })}
            </span>
            {pageInfo.hasNextPage && pageInfo.endCursor && (
              <Link
                href={listingHref(basePath, state, { after: pageInfo.endCursor, page: state.page + 1 })}
                className="flex h-10 items-center gap-1 rounded-[3px] border border-line px-3 hover:border-ink"
              >
                {dict.listing.nextPage}
                <ChevronRightIcon className="size-4" />
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="space-y-3 p-3">
          <div className="aspect-square rounded bg-surface" />
          <div className="h-4 w-1/2 rounded bg-surface" />
          <div className="h-4 w-3/4 rounded bg-surface" />
        </div>
      ))}
    </div>
  );
}
