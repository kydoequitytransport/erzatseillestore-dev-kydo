import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountAccess } from "@/components/account/account-access";
import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n/server";
import { shopifyConfig } from "@/lib/shopify";

export const instant = false;

const CUSTOMER_SESSION_COOKIE_NAMES = [
  "shopify_customer_access_token",
  "shopify_customer_email",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.account.login, robots: { index: false } };
}

export default async function AccountLoginPage({
  searchParams,
}: PageProps<"/[locale]/account/login">) {
  const { locale, dict } = await getI18n();
  const cookieStore = await cookies();
  if (CUSTOMER_SESSION_COOKIE_NAMES.every((name) => cookieStore.get(name)?.value)) {
    redirect(`/${locale}/account`);
  }

  const { error } = await searchParams;
  const callbackUrl = shopifyConfig.customerAccountRedirectUri
    ? new URL(shopifyConfig.customerAccountRedirectUri)
    : null;
  const siteUrl = new URL(siteConfig.url);
  const validCallback =
    callbackUrl?.protocol === "https:" &&
    callbackUrl.pathname === "/api/customer/callback" &&
    siteUrl.protocol === "https:" &&
    callbackUrl.origin === siteUrl.origin;
  const authorizationUrl = shopifyConfig.customerAccountClientId && validCallback
    ? `/api/customer/login?locale=${locale}`
    : null;

  return (
    <div className="container-site min-h-[220px] py-8 md:min-h-[220px] md:py-6">
      <section className="mx-auto max-w-[440px]">
        <h1 className="mb-6 text-center text-[24px] font-bold">{dict.account.login}</h1>
        <AccountAccess authorizationUrl={authorizationUrl} error={error === "auth"} />
      </section>
    </div>
  );
}
