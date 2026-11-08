import type { Metadata } from "next";
import { AccountAccess } from "@/components/account/account-access";
import { getI18n } from "@/i18n/server";
import { shopifyConfig } from "@/lib/shopify";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.account.login, robots: { index: false } };
}

export default async function AccountLoginPage() {
  const { locale, dict } = await getI18n();
  const accountUrl = shopifyConfig.customerAccountUrl ? new URL(shopifyConfig.customerAccountUrl) : null;
  if (accountUrl && accountUrl.protocol !== "https:") {
    throw new Error("SHOPIFY_CUSTOMER_ACCOUNT_URL must use HTTPS");
  }
  accountUrl?.searchParams.set("locale", locale);

  return (
    <div className="container-site min-h-[220px] py-8 md:min-h-[220px] md:py-6">
      <section className="mx-auto max-w-[440px]">
        <h1 className="mb-6 text-center text-[24px] font-bold">{dict.account.login}</h1>
        <AccountAccess accountUrl={accountUrl?.toString() ?? null} />
      </section>
    </div>
  );
}
