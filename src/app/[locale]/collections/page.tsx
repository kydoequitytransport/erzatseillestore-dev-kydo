import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CollectionList } from "@/components/home/sections";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getCollections } from "@/lib/shopify";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  return { title: dict.meta.allCategories, alternates: { canonical: localizePath(locale, "/collections") } };
}

export default async function CollectionsPage() {
  const { locale, dict } = await getI18n();
  const collections = await getCollections(locale);
  return (
    <div className="container-site py-6 md:py-8">
      <Breadcrumbs items={[{ label: dict.listing.categories }]} />
      <h1 className="mb-2 text-[28px] md:text-4xl">{dict.meta.allCategories}</h1>
      <div className="-mx-2.5 sm:-mx-4 lg:-mx-6">
        <CollectionList collections={collections} showButton={false} />
      </div>
    </div>
  );
}
