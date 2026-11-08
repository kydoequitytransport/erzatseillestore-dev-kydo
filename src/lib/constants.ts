export type SortOption = {
  /** URL value; labels live in the dictionaries under `listing.sort`. */
  slug: string | null;
  /** Sort key for `collection.products` (ProductCollectionSortKeys). */
  collectionKey: string;
  /** Sort key for `products` / search (ProductSortKeys). */
  productKey: string;
  reverse: boolean;
};

export const SORT_OPTIONS: SortOption[] = [
  { slug: null, collectionKey: "COLLECTION_DEFAULT", productKey: "RELEVANCE", reverse: false },
  { slug: "best-selling", collectionKey: "BEST_SELLING", productKey: "BEST_SELLING", reverse: false },
  { slug: "title-ascending", collectionKey: "TITLE", productKey: "TITLE", reverse: false },
  { slug: "title-descending", collectionKey: "TITLE", productKey: "TITLE", reverse: true },
  { slug: "price-ascending", collectionKey: "PRICE", productKey: "PRICE", reverse: false },
  { slug: "price-descending", collectionKey: "PRICE", productKey: "PRICE", reverse: true },
  { slug: "created-ascending", collectionKey: "CREATED", productKey: "CREATED_AT", reverse: false },
  { slug: "created-descending", collectionKey: "CREATED", productKey: "CREATED_AT", reverse: true },
];

export function getSortOption(slug: string | undefined | null) {
  return SORT_OPTIONS.find((o) => o.slug === (slug || null)) ?? SORT_OPTIONS[0];
}

export const PAGE_SIZE = 24;
