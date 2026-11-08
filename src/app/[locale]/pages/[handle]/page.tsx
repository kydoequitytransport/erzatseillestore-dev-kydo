import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getI18n } from "@/i18n/server";
import { getPage } from "@/lib/shopify";

type Props = PageProps<"/[locale]/pages/[handle]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await getI18n();
  const page = await getPage(locale, (await params).handle);
  if (!page) return {};
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
  };
}

async function PageContent({ params }: Pick<Props, "params">) {
  const { locale } = await getI18n();
  const page = await getPage(locale, (await params).handle);
  if (!page) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: page.title }]} />
      <h1 className="mb-6 text-[28px] md:text-4xl">{page.title}</h1>
      <div className="rte max-w-3xl" dangerouslySetInnerHTML={{ __html: page.body }} />
    </>
  );
}

export default function ShopifyPage({ params }: Props) {
  return (
    <div className="container-site py-6 md:py-8">
      <Suspense fallback={<div className="h-64 animate-pulse rounded bg-surface" />}>
        <PageContent params={params} />
      </Suspense>
    </div>
  );
}
