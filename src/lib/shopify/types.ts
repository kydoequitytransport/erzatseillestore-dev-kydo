export type Connection<T> = { nodes: T[] };

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type SEO = {
  title: string | null;
  description: string | null;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductOption = {
  id: string;
  name: string;
  optionValues: { name: string }[];
};

export type ProductVariant = {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
};

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  availableForSale: boolean;
  featuredImage: Image | null;
  /** First two images; the second one is shown on hover. */
  images: Connection<Image>;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { maxVariantPrice: Money };
  /** First variant, used for one-click add to cart on single-variant products. */
  variants: Connection<Pick<ProductVariant, "id" | "availableForSale" | "quantityAvailable">>;
  options: Pick<ProductOption, "name" | "optionValues">[];
  /** Derived: the product has a single "Default Title" variant. */
  hasOnlyDefaultVariant: boolean;
};

export type Product = Omit<ProductCard, "variants" | "options"> & {
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  options: ProductOption[];
  images: Connection<Image>;
  variants: Connection<ProductVariant>;
  seo: SEO;
  updatedAt: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: Image | null;
  seo: SEO;
  updatedAt: string;
};

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

export type ProductSortKey =
  | "RELEVANCE"
  | "BEST_SELLING"
  | "CREATED_AT"
  | "PRICE"
  | "TITLE"
  | "COLLECTION_DEFAULT"
  | "MANUAL";

export type ProductList = {
  products: ProductCard[];
  pageInfo: PageInfo;
};

export type MenuItem = {
  title: string;
  /** `null` for group headings that are not links (Shopify menu items pointing to `#`). */
  path: string | null;
  items: MenuItem[];
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    selectedOptions: SelectedOption[];
    image: Image | null;
    product: { handle: string; title: string; vendor: string; featuredImage: Image | null };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: CartLine[];
};

export type ShopifyCart = Omit<Cart, "lines"> & { lines: Connection<CartLine> };

export type Article = {
  id: string;
  handle: string;
  title: string;
  excerpt: string | null;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  image: Image | null;
  authorV2: { name: string } | null;
  blog: { handle: string; title: string };
  seo: SEO | null;
};

export type ArticleLink = Pick<Article, "handle" | "title">;

export type ArticleWithSiblings = Article & {
  /** The newer article in the same blog. */
  previous: ArticleLink | null;
  /** The older article in the same blog. */
  next: ArticleLink | null;
};

export type Page = {
  id: string;
  handle: string;
  title: string;
  body: string;
  bodySummary: string;
  seo: SEO | null;
};

export type PredictiveSearchResult = {
  products: Pick<ProductCard, "id" | "handle" | "title" | "vendor" | "featuredImage" | "priceRange">[];
  collections: Pick<Collection, "id" | "handle" | "title">[];
  queries: { text: string; styledText: string }[];
};
