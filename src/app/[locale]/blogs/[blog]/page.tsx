import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Link } from "@/i18n/client";
import { INTL_LOCALE, localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getBlogArticles } from "@/lib/shopify";
import { formatDate, stripHtml, truncate } from "@/lib/utils";

type Props = PageProps<"/[locale]/blogs/[blog]">;

async function loadBlog({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const { locale } = await getI18n();
  const [{ blog }, query] = await Promise.all([params, searchParams]);
  const after = typeof query.after === "string" ? query.after : undefined;
  const before = typeof query.before === "string" ? query.before : undefined;
  const result = await getBlogArticles({ locale, handle: blog, first: 12, after, before });
  if (!result) notFound();
  return { locale, blog, result };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, blog, result } = await loadBlog({ params, searchParams });
  const path = `/blogs/${blog}`;
  return {
    title: result.title,
    alternates: { canonical: localizePath(locale, path) },
  };
}

async function BlogContent({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const [{ locale, blog, result }, { dict }] = await Promise.all([
    loadBlog({ params, searchParams }),
    getI18n(),
  ]);
  const path = `/blogs/${blog}`;
  const prevHref =
    result.pageInfo.hasPreviousPage && result.pageInfo.startCursor
      ? `${path}?before=${encodeURIComponent(result.pageInfo.startCursor)}`
      : null;
  const nextHref =
    result.pageInfo.hasNextPage && result.pageInfo.endCursor
      ? `${path}?after=${encodeURIComponent(result.pageInfo.endCursor)}`
      : null;

  return (
    <div className="container-site py-5 md:py-8">
      <Breadcrumbs items={[{ label: result.title }]} />
      <h1 className="mb-6 text-[26px] font-bold md:text-[32px]">{result.title}</h1>

      {result.articles.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.articles.map((article) => {
            const href = `${path}/${article.handle}`;
            return (
              <li key={article.id} className="flex flex-col border border-line bg-white">
                <Link
                  href={href}
                  className="relative block aspect-[16/10] overflow-hidden bg-surface"
                  aria-label={article.title}
                >
                  {article.image && (
                    <Image
                      src={article.image.url}
                      alt={article.image.altText ?? article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                    />
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <p className="mb-2 text-[12px] text-muted">
                    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, INTL_LOCALE[locale])}</time>
                    {article.authorV2 && ` · ${article.authorV2.name}`}
                  </p>
                  <h2 className="mb-2 text-[18px] leading-snug">
                    <Link href={href} className="hover:text-brand">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="mb-4 text-[13px] text-muted">
                    {truncate(article.excerpt || stripHtml(article.contentHtml), 180)}
                  </p>
                  <Link href={href} className="link-underline mt-auto text-[13px] font-bold">
                    {dict.home.readMore}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-12 text-center text-muted">{dict.search.noResults}</p>
      )}

      {(prevHref || nextHref) && (
        <nav aria-label={dict.listing.pagination} className="mt-8 flex justify-between gap-4">
          {prevHref ? (
            <Link href={prevHref} className="btn-secondary px-4 py-2">
              {dict.listing.previousPage}
            </Link>
          ) : (
            <span />
          )}
          {nextHref && (
            <Link href={nextHref} className="btn-secondary px-4 py-2">
              {dict.listing.nextPage}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

export default function BlogPage(props: Props) {
  return (
    <Suspense fallback={<div className="container-site h-[60vh] animate-pulse py-8" />}>
      <BlogContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
