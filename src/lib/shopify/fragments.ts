export const IMAGE = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_CARD = /* GraphQL */ `
  fragment ProductCardFields on Product {
    id
    handle
    title
    vendor
    availableForSale
    featuredImage {
      ...ImageFields
    }
    images(first: 2) {
      nodes { ...ImageFields }
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 1) {
      nodes { id availableForSale quantityAvailable }
    }
    options(first: 3) {
      name
      optionValues { name }
    }
  }
`;

export const PRODUCT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    vendor
    productType
    tags
    description
    descriptionHtml
    availableForSale
    updatedAt
    featuredImage {
      ...ImageFields
    }
    images(first: 20) {
      nodes { ...ImageFields }
    }
    options {
      id
      name
      optionValues { name }
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 100) {
      nodes {
        id
        title
        sku
        availableForSale
        quantityAvailable
        selectedOptions { name value }
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        image { ...ImageFields }
      }
    }
    seo { title description }
  }
`;

export const COLLECTION = /* GraphQL */ `
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    descriptionHtml
    updatedAt
    image { ...ImageFields }
    seo { title description }
  }
`;

export const CART = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            quantityAvailable
            selectedOptions { name value }
            image { ...ImageFields }
            product {
              handle
              title
              vendor
              featuredImage { ...ImageFields }
            }
          }
        }
      }
    }
  }
`;

export const ARTICLE = /* GraphQL */ `
  fragment ArticleFields on Article {
    id
    handle
    title
    excerpt
    contentHtml
    publishedAt
    tags
    image { ...ImageFields }
    authorV2 { name }
    blog { handle title }
    seo { title description }
  }
`;
