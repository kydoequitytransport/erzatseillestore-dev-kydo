import { ARTICLE, CART, COLLECTION, IMAGE, PRODUCT, PRODUCT_CARD } from "./fragments";

/** Appends each fragment once so queries can freely combine fragments. */
const doc = (body: string, ...fragments: string[]) => {
  const parts = [body, ...new Set(fragments)];
  if (parts.some((p) => p.includes("...ImageFields"))) parts.push(IMAGE);
  return parts.join("\n");
};

const PAGE_INFO = "pageInfo { hasNextPage hasPreviousPage startCursor endCursor }";

export const MENU_QUERY = doc(/* GraphQL */ `
  query Menu($handle: String!) {
    menu(handle: $handle) {
      items {
        title
        url
        items {
          title
          url
          items { title url }
        }
      }
    }
  }
`);

export const COLLECTIONS_QUERY = doc(
  /* GraphQL */ `
    query Collections($first: Int!) {
      collections(first: $first, sortKey: TITLE) {
        nodes { ...CollectionFields }
      }
    }
  `,
  COLLECTION,
);

export const COLLECTION_QUERY = doc(
  /* GraphQL */ `
    query Collection($handle: String!) {
      collection(handle: $handle) { ...CollectionFields }
    }
  `,
  COLLECTION,
);

export const COLLECTION_PRODUCTS_QUERY = doc(
  /* GraphQL */ `
    query CollectionProducts(
      $handle: String!
      $first: Int
      $last: Int
      $after: String
      $before: String
      $sortKey: ProductCollectionSortKeys
      $reverse: Boolean
      $filters: [ProductFilter!]
    ) {
      collection(handle: $handle) {
        products(
          first: $first
          last: $last
          after: $after
          before: $before
          sortKey: $sortKey
          reverse: $reverse
          filters: $filters
        ) {
          filters {
            id
            label
            type
            values { id label count input }
          }
          nodes { ...ProductCardFields }
          ${PAGE_INFO}
        }
      }
    }
  `,
  PRODUCT_CARD,
);

export const PRODUCTS_QUERY = doc(
  /* GraphQL */ `
    query Products(
      $first: Int
      $last: Int
      $after: String
      $before: String
      $query: String
      $sortKey: ProductSortKeys
      $reverse: Boolean
    ) {
      products(
        first: $first
        last: $last
        after: $after
        before: $before
        query: $query
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes { ...ProductCardFields }
        ${PAGE_INFO}
      }
    }
  `,
  PRODUCT_CARD,
);

export const PRODUCT_QUERY = doc(
  /* GraphQL */ `
    query Product($handle: String!) {
      product(handle: $handle) { ...ProductFields }
    }
  `,
  PRODUCT,
);

/** One aliased `product(handle:)` field per handle (`p0`, `p1`, …). */
export const productsByHandleQuery = (count: number) => {
  const indexes = Array.from({ length: count }, (_, i) => i);
  return doc(
    /* GraphQL */ `
      query ProductsByHandle(${indexes.map((i) => `$h${i}: String!`).join(", ")}) {
        ${indexes.map((i) => `p${i}: product(handle: $h${i}) { ...ProductCardFields }`).join("\n")}
      }
    `,
    PRODUCT_CARD,
  );
};

export const PRODUCT_RECOMMENDATIONS_QUERY = doc(
  /* GraphQL */ `
    query ProductRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) { ...ProductCardFields }
    }
  `,
  PRODUCT_CARD,
);

export const PREDICTIVE_SEARCH_QUERY = doc(/* GraphQL */ `
  query PredictiveSearch($query: String!, $limit: Int!) {
    predictiveSearch(query: $query, limit: $limit, types: [PRODUCT, COLLECTION, QUERY]) {
      products {
        id
        handle
        title
        vendor
        featuredImage { ...ImageFields }
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
      }
      collections { id handle title }
      queries { text styledText }
    }
  }
`);

export const ARTICLES_QUERY = doc(
  /* GraphQL */ `
    query Articles($first: Int!) {
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        nodes { ...ArticleFields }
      }
    }
  `,
  ARTICLE,
);

export const BLOG_ARTICLES_QUERY = doc(
  /* GraphQL */ `
    query BlogArticles($handle: String!, $first: Int, $after: String, $last: Int, $before: String) {
      blog(handle: $handle) {
        title
        articles(first: $first, after: $after, last: $last, before: $before, sortKey: PUBLISHED_AT, reverse: true) {
          nodes { ...ArticleFields }
          ${PAGE_INFO}
        }
      }
    }
  `,
  ARTICLE,
);

export const ARTICLE_QUERY = doc(
  /* GraphQL */ `
    query Article($blog: String!, $handle: String!) {
      blog(handle: $blog) {
        articleByHandle(handle: $handle) { ...ArticleFields }
        articles(first: 250, sortKey: PUBLISHED_AT, reverse: true) {
          nodes { handle title }
        }
      }
    }
  `,
  ARTICLE,
);

export const PAGE_QUERY = /* GraphQL */ `
  query Page($handle: String!) {
    page(handle: $handle) {
      id
      handle
      title
      body
      bodySummary
      seo { title description }
    }
  }
`;

export const CART_QUERY = doc(
  /* GraphQL */ `
    query Cart($cartId: ID!) {
      cart(id: $cartId) { ...CartFields }
    }
  `,
  CART,
);

export const CART_CHECKOUT_URL_QUERY = doc(/* GraphQL */ `
  query CartCheckoutUrl($cartId: ID!) {
    cart(id: $cartId) { checkoutUrl }
  }
`);

const USER_ERRORS = "userErrors { field message }";

export const CART_CREATE_MUTATION = doc(
  /* GraphQL */ `
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart { ...CartFields }
        ${USER_ERRORS}
      }
    }
  `,
  CART,
);

export const CART_LINES_ADD_MUTATION = doc(
  /* GraphQL */ `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        ${USER_ERRORS}
      }
    }
  `,
  CART,
);

export const CART_LINES_UPDATE_MUTATION = doc(
  /* GraphQL */ `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        ${USER_ERRORS}
      }
    }
  `,
  CART,
);

export const CART_LINES_REMOVE_MUTATION = doc(
  /* GraphQL */ `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
        ${USER_ERRORS}
      }
    }
  `,
  CART,
);

export const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id }
      customerUserErrors { code message }
    }
  }
`;
