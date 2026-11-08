import { PaymentBadges } from "@/components/payment-badges";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/client";
import { getI18n } from "@/i18n/server";
import { getCollections, getMenu, type MenuItem } from "@/lib/shopify";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

function FooterLinks({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-bold text-white">{title}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.title}>
            <Link href={item.path ?? "/"} className="text-white/80 transition hover:text-brand">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const { locale, dict } = await getI18n();
  const [footerMenu, collections] = await Promise.all([
    getMenu(locale, siteConfig.menus.footer),
    getCollections(locale),
  ]);
  const mainLinks: MenuItem[] = collections.map((c) => ({
    title: c.title,
    path: `/collections/${c.handle}`,
    items: [],
  }));
  const { contact, phone } = siteConfig;

  return (
    <footer className="mt-12 bg-black pt-12 pb-7 text-white">
      <div className="container-site grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 text-sm text-white/80">
          <Logo inverted label={dict.header.home} />
          <address className="pt-2 leading-6 not-italic">
            {contact.company}
            <br />
            {contact.street}
            <br />
            {contact.city}
            <br />
            Mail:{" "}
            <a href={`mailto:${contact.email}`} className="hover:text-brand">
              {contact.email}
            </a>
          </address>
        </div>

        <FooterLinks title={dict.footer.mainMenu} items={mainLinks} />

        <div>
          <h3 className="mb-4 text-base font-bold">{dict.footer.newsletter}</h3>
          <p className="mb-4 text-sm text-white/80">{dict.footer.newsletterText}</p>
          <NewsletterForm />
        </div>

        <div className="text-sm text-white/80">
          <h3 className="mb-4 text-base font-bold text-white">{dict.footer.questions}</h3>
          <p className="mb-3">{dict.footer.questionsText}</p>
          <p className="mb-1">{dict.footer.hours}</p>
          <p>
            {dict.footer.hotline}:{" "}
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-bold text-white hover:text-brand">
              {phone}
            </a>
          </p>
        </div>
      </div>

      <div className="container-site mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>
            © {siteConfig.name}. {dict.footer.rights}
          </span>
          {footerMenu.map(
            (item) =>
              item.path && (
                <Link key={item.title} href={item.path} className="hover:text-brand">
                  {item.title}
                </Link>
              ),
          )}
        </div>
        <PaymentBadges label={dict.footer.paymentMethods} />
      </div>
    </footer>
  );
}
