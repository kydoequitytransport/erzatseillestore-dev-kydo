import { Link } from "@/i18n/client";
import { getI18n } from "@/i18n/server";

export async function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const { dict } = await getI18n();
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-brand">
            {dict.header.home}
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
