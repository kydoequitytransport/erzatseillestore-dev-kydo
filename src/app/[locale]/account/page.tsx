import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOutCustomer } from "@/components/account/actions";
import { getI18n } from "@/i18n/server";

export const instant = false;

export default async function AccountPage() {
  const { locale, dict } = await getI18n();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("shopify_customer_access_token")?.value;
  const email = cookieStore.get("shopify_customer_email")?.value;

  if (!accessToken || !email) redirect(`/${locale}/account/login`);

  return (
    <div className="container-site min-h-[220px] py-8 md:py-6">
      <section className="mx-auto max-w-[560px] rounded-[3px] border border-line bg-white p-6">
        <h1 className="mb-4 text-2xl font-bold">{dict.account.login}</h1>
        <p className="text-sm text-muted">{dict.account.signedInAs}</p>
        <p className="mb-6 font-semibold">{email}</p>
        <form action={signOutCustomer.bind(null, locale)}>
          <button type="submit" className="btn-secondary">
            {dict.account.logout}
          </button>
        </form>
      </section>
    </div>
  );
}
