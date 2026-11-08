import Image from "next/image";
import { highlightIcons } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/client";
import { INTL_LOCALE } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import type { Article, Collection, ProductCard as ProductCardType } from "@/lib/shopify/types";
import { cn, formatDate, stripHtml, truncate } from "@/lib/utils";

const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  "automated-collection": "/categories/automotive-parts.svg",
  frontpage: "/categories/home-page.svg",
  hydrogen: "/categories/hydrogen.svg",
};

export async function HighlightsBanner() {
  const { dict } = await getI18n();
  return (
    <section className="border-b border-line bg-white">
      <ul className="container-site grid grid-cols-2 gap-x-2 gap-y-5 py-5 md:py-6 lg:grid-cols-4">
        {siteConfig.highlightIcons.map((icon, i) => {
          const Icon = highlightIcons[icon];
          const h = dict.highlights[i];
          return (
            <li
              key={icon}
              className="flex flex-col items-center gap-2 px-1 text-center sm:flex-row sm:justify-center sm:gap-3 lg:text-left"
            >
              <Icon className="size-8 shrink-0 text-brand" />
              <div>
                <p className="text-[14px] leading-tight font-bold sm:text-[15px]">{h.title}</p>
                <p className="hidden text-[13px] text-muted sm:block">{h.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PromoBlock({ collection, className, sizes }: { collection: Collection; className?: string; sizes: string }) {
  return (
    <Link
      href={`/collections/${collection.handle}`}
      className={cn("group relative block overflow-hidden rounded-[3px] bg-surface", className)}
    >
      {collection.image && (
        <Image
          src={collection.image.url}
          alt={collection.image.altText ?? collection.title}
          fill
          sizes={sizes}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute right-3 bottom-3 left-3 font-heading text-base leading-tight font-bold text-white sm:right-5 sm:bottom-5 sm:left-5 md:text-2xl">
        {collection.title}
      </span>
    </Link>
  );
}

export function PromoMosaic({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;
  return (
    <section className="container-site mt-8 md:mt-10">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr] md:gap-4">
        {collections.slice(0, 2).map((c) => (
          <PromoBlock key={c.id} collection={c} className="aspect-[16/9]" sizes="(min-width: 768px) 50vw, 100vw" />
        ))}
      </div>
    </section>
  );
}

export function PromoGrid({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;
  return (
    <section className="container-site mt-8 md:mt-10">
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {collections.slice(0, 4).map((c) => (
          <PromoBlock key={c.id} collection={c} className="aspect-[4/5]" sizes="(min-width: 1024px) 25vw, 50vw" />
        ))}
      </div>
    </section>
  );
}

export async function CollectionList({
  title,
  collections,
  showButton = true,
}: {
  title?: string;
  collections: Collection[];
  showButton?: boolean;
}) {
  const { dict } = await getI18n();
  if (!collections.length) return null;
  return (
    <section className="container-site mt-8 md:mt-10">
      {title && <h2 className="section-title mb-5 text-center md:mb-6">{title}</h2>}
      <ul className="flex flex-wrap justify-center gap-3 md:gap-4">
        {collections.map((c) => (
          <li
            key={c.id}
            className="w-[calc(33.333%-0.5rem)] sm:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)]"
          >
            <Link href={`/collections/${c.handle}`} className="group block text-center">
              <span className="relative mb-2 block aspect-square overflow-hidden rounded-full bg-[#f5f5f5] md:mb-3">
                {(c.image || CATEGORY_IMAGE_FALLBACKS[c.handle]) && (
                  <Image
                    src={c.image?.url ?? CATEGORY_IMAGE_FALLBACKS[c.handle]}
                    alt={c.image?.altText ?? c.title}
                    fill
                    loading="eager"
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
              </span>
              <span className="block text-[12px] leading-snug text-brand-dark group-hover:text-brand md:text-[13px]">{c.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      {showButton && (
        <div className="mt-6 text-center">
          <Link href="/collections" className="btn-primary">
            {dict.home.discover}
          </Link>
        </div>
      )}
    </section>
  );
}

export async function FeaturedCollection({
  title,
  subtitle,
  href,
  products,
}: {
  title: string;
  subtitle: string;
  href: string;
  products: ProductCardType[];
}) {
  const { dict } = await getI18n();
  if (!products.length) return null;
  return (
    <section className="container-site mt-8 md:mt-10">
      <h2 className="section-title mb-4 md:mb-5">{title}</h2>
      <div className="-mx-2.5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2.5 pb-2 no-scrollbar sm:mx-0 sm:gap-3 sm:px-0">
        <div className="flex w-[44%] shrink-0 snap-start flex-col items-center justify-center rounded-[3px] bg-brand-light p-4 text-center sm:w-[30%] sm:p-6 lg:w-[19%]">
          <h3 className="mb-4 text-lg md:text-2xl">{subtitle}</h3>
          <Link href={href} className="btn-primary px-4 sm:px-7">
            {dict.home.discover}
          </Link>
        </div>
        {products.map((p) => (
          <div key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-[19%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

export async function BlogPosts({ title, articles }: { title: string; articles: Article[] }) {
  const { locale, dict } = await getI18n();
  if (!articles.length) return null;
  const blogHref = `/blogs/${articles[0].blog.handle}`;
  return (
    <section className="container-site mt-8 md:mt-10">
      <h2 className="section-title mb-5 md:mb-6">{title}</h2>
      <ul className="grid gap-6 md:grid-cols-3">
        {articles.map((a) => {
          const href = `/blogs/${a.blog.handle}/${a.handle}`;
          return (
            <li key={a.id} className="flex flex-col">
              <Link href={href} className="relative mb-4 block aspect-[16/10] overflow-hidden rounded-[3px] bg-surface">
                {a.image && (
                  <Image
                    src={a.image.url}
                    alt={a.image.altText ?? a.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                )}
              </Link>
              <p className="mb-1 text-[13px] text-muted">
                {formatDate(a.publishedAt, INTL_LOCALE[locale])}
                {a.authorV2 && ` · ${a.authorV2.name}`}
              </p>
              <h3 className="mb-2 text-lg leading-snug">
                <Link href={href} className="hover:text-brand">
                  {a.title}
                </Link>
              </h3>
              <p className="mb-3 text-sm text-muted">{truncate(a.excerpt || stripHtml(a.contentHtml), 220)}</p>
              <Link href={href} className="link-underline mt-auto text-sm font-bold">
                {dict.home.readMore}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 text-center">
        <Link href={blogHref} className="link-underline text-sm font-bold">
          {dict.home.viewAllNews}
        </Link>
      </div>
    </section>
  );
}
