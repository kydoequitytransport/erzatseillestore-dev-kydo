/**
 * Store-wide settings that are not managed in Shopify. Translatable copy lives
 * in `src/i18n/dictionaries`; catalog data, menus, blog posts and pages come from Shopify.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Store24",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  phone: "+41 00 000 00 00",

  contact: {
    company: "Musterfirma GmbH",
    street: "Musterstrasse 1",
    city: "CH-8000 Zürich",
    email: "info@example.ch",
  },

  /** Icons for the four USP blocks; texts are in the dictionaries (`highlights`). */
  highlightIcons: ["truck", "lock", "support", "flag"] as const,

  paymentMethods: ["TWINT", "VISA", "Mastercard", "PostFinance", "Apple Pay", "Google Pay"],

  menus: {
    main: "main-menu",
    footer: "footer",
  },

  /** Shopify collection handles for the homepage sections. Empty = automatic. */
  home: {
    slideshow: [] as string[],
    mosaic: [] as string[],
    featuredCategories: [] as string[],
    promoGrid: [] as string[],
  },
} as const;

export type HighlightIcon = (typeof siteConfig.highlightIcons)[number];
