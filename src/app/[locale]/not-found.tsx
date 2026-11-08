import { Link } from "@/i18n/client";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { dict } = await getI18n();
  return (
    <div className="container-site py-24 text-center">
      <p className="mb-2 font-heading text-6xl font-bold text-brand">404</p>
      <h1 className="mb-4 text-2xl">{dict.notFound.title}</h1>
      <p className="mb-8 text-muted">{dict.notFound.text}</p>
      <Link href="/" className="btn-primary">
        {dict.notFound.backHome}
      </Link>
    </div>
  );
}
