import { getI18n } from "@/i18n/server";

export async function AccountAccess({
  authorizationUrl,
  error,
}: {
  authorizationUrl: string | null;
  error: boolean;
}) {
  const { dict } = await getI18n();

  return (
    <div className="mx-auto max-w-[440px] rounded-[3px] border border-line bg-white p-6 text-center">
      <p className="mb-6 text-sm leading-relaxed text-muted">{dict.account.description}</p>
      {error && (
        <p role="alert" className="mb-4 rounded-[3px] bg-brand-light px-3 py-3 text-sm text-ink">
          {dict.account.authError}
        </p>
      )}
      {authorizationUrl ? (
        <a href={authorizationUrl} className="btn-primary w-full">
          {dict.account.continue}
        </a>
      ) : (
        <p role="status" className="rounded-[3px] bg-brand-light px-3 py-3 text-sm text-ink">
          {dict.account.unavailable}
        </p>
      )}
    </div>
  );
}
