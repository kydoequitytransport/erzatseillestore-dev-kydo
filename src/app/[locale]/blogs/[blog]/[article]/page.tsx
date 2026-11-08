import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { ShareButtons } from "@/components/share-buttons";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/client";
import { INTL_LOCALE, LOCALES, localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getArticle } from "@/lib/shopify";
import { formatDate } from "@/lib/utils";

type Props = PageProps<"/[locale]/blogs/[blog]/[article]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await getI18n();
  const { blog, article: handle } = await params;
  const article = await getArticle(locale, blog, handle);
  if (!article) return {};
  const path = `/blogs/${blog}/${handle}`;
  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt || undefined,
    alternates: {
      canonical: localizePath(locale, path),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, path)])),
    },
    openGraph: article.image ? { images: [article.image.url], type: "article" } : { type: "article" },
  };
}

async function ArticleContent({ params }: Pick<Props, "params">) {
  const { locale, dict } = await getI18n();
  const { blog, article: handle } = await params;
  const article = await getArticle(locale, blog, handle);
  if (!article) notFound();

  const url = `${siteConfig.url}${localizePath(locale, `/blogs/${blog}/${handle}`)}`;
  const share = { url, title: article.title, image: article.image?.url, dict: dict.article };
  const articleHref = (h: string) => `/blogs/${article.blog.handle}/${h}`;

  return (
    <article>
      {article.image && (
        <figure className="relative aspect-[16/9] max-h-[560px] w-full overflow-hidden bg-surface md:aspect-[21/8]">
          <Image
            src={article.image.url}
            alt={article.image.altText ?? article.title}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
        </figure>
      )}

      <div className="container-site py-8 md:py-12">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[140px_minmax(0,680px)] lg:justify-center lg:gap-10">
          <ShareButtons {...share} className="hidden lg:sticky lg:top-60 lg:flex lg:self-start" />

          <div className="min-w-0 max-w-3xl">
            <p className="mb-2 flex flex-wrap gap-x-3 text-sm text-muted">
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, INTL_LOCALE[locale])}</time>
              {article.authorV2 && (
                <>
                  <span aria-hidden>|</span>
                  <span>{article.authorV2.name}</span>
                </>
              )}
            </p>
            <h1 className="mb-6 text-[25px] leading-tight font-bold md:text-[30px]">{article.title}</h1>
            <div className="rte" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />

            {article.tags.length > 0 && (
              <p className="mt-8 text-sm">
                <span className="mr-1 font-bold">{dict.article.classifiedUnder}</span>
                {article.tags.join(", ")}
              </p>
            )}

            <ShareButtons {...share} className="mt-6 lg:hidden" />

            {(article.previous || article.next) && (
              <nav className="mt-10 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
                {article.previous ? (
                  <Link href={articleHref(article.previous.handle)} className="group flex items-start gap-2">
                    <ChevronLeftIcon className="mt-0.5 size-5 shrink-0 text-brand" />
                    <span>
                      <span className="block text-sm text-muted">{dict.article.previousArticle}</span>
                      <span className="font-bold group-hover:text-brand">{article.previous.title}</span>
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {article.next && (
                  <Link
                    href={articleHref(article.next.handle)}
                    className="group flex items-start justify-end gap-2 text-right"
                  >
                    <span>
                      <span className="block text-sm text-muted">{dict.article.nextArticle}</span>
                      <span className="font-bold group-hover:text-brand">{article.next.title}</span>
                    </span>
                    <ChevronRightIcon className="mt-0.5 size-5 shrink-0 text-brand" />
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ArticlePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-[60vh] animate-pulse bg-surface" />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}
