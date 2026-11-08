import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetails } from "@/components/product/product-details";
import { TrackProductView } from "@/components/product/recently-viewed";
import { siteConfig } from "@/config/site";
import { LOCALES, localizePath, type Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getProduct, getProductRecommendations, getProducts, type Product } from "@/lib/shopify";

type Props = PageProps<"/[locale]/products/[handle]">;

export async function generateStaticParams() {
  const { locale } = await getI18n();
  const { products } = await getProducts({ locale, first: 12, sortKey: "BEST_SELLING" });
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await getI18n();
  const { handle } = await params;
  const product = await getProduct(locale, handle);
  if (!product) return {};
  const image = product.featuredImage;
  const path = `/products/${handle}`;
  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description.slice(0, 160),
    alternates: {
      canonical: localizePath(locale, path),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, path)])),
    },
    openGraph: image
      ? { images: [{ url: image.url, width: image.width ?? undefined, height: image.height ?? undefined }] }
      : undefined,
  };
}

function ProductJsonLd({ product, locale }: { product: Product; locale: Locale }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((i) => i.url),
    brand: product.vendor ? { "@type": "Brand", name: product.vendor } : undefined,
    offers: product.variants.nodes.map((v) => ({
      "@type": "Offer",
      url: `${siteConfig.url}${localizePath(locale, `/products/${product.handle}`)}`,
      sku: v.sku || undefined,
      price: v.price.amount,
      priceCurrency: v.price.currencyCode,
      availability: v.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

async function Recommendations({ productId }: { productId: string }) {
  const { locale, dict } = await getI18n();
  const products = (await getProductRecommendations(locale, productId)).slice(0, 5);
  if (!products.length) return null;
  return (
    <section className="mt-12 md:mt-16">
      <h2 className="section-title mb-6 text-center">{dict.product.alsoInterested}</h2>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-5">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

async function ProductView({ params }: Pick<Props, "params">) {
  const { locale } = await getI18n();
  const { handle } = await params;
  const product = await getProduct(locale, handle);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} locale={locale} />
      <Breadcrumbs
        items={[
          ...(product.productType
            ? [{ label: product.productType, href: `/search?q=${encodeURIComponent(product.productType)}` }]
            : []),
          { label: product.title },
        ]}
      />
      <ProductDetails product={product} />
      <TrackProductView handle={product.handle} />

      <Suspense fallback={null}>
        <Recommendations productId={product.id} />
      </Suspense>
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      <div className="aspect-square rounded bg-surface" />
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-surface" />
        <div className="h-9 w-3/4 rounded bg-surface" />
        <div className="h-8 w-32 rounded bg-surface" />
        <div className="h-12 w-full rounded bg-surface" />
      </div>
    </div>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <div className="container-site py-6 md:py-8">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductView params={params} />
      </Suspense>
    </div>
  );
}
