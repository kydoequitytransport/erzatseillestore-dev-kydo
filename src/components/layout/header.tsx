import { CartButton } from "@/components/cart/cart-button";
import { UserIcon } from "@/components/icons";
import { Link } from "@/i18n/client";
import { getI18n } from "@/i18n/server";
import { getMainMenu } from "@/lib/navigation";
import { Logo } from "./logo";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { SearchBar } from "./search-bar";

export async function Header() {
  const { locale, dict } = await getI18n();
  const menu = await getMainMenu(locale);

  return (
    <header className="sticky top-0 z-[1110] bg-white shadow-[0_1px_4px_#80808040]">
      <div className="container-site flex items-center gap-3 py-2 sm:gap-4 md:py-3 lg:gap-8 lg:py-3">
        <MobileMenu items={menu} />
        <Logo className="shrink-0" label={dict.header.home} />
        <SearchBar categories={menu} className="hidden flex-1 md:block lg:mx-6" />
        <div className="ml-auto flex items-center gap-5 md:ml-0">
          <Link
            href="/account/login"
            className="hidden flex-col items-center gap-0.5 text-[13px] font-bold hover:text-brand sm:flex"
          >
            <UserIcon className="size-7" />
            <span className="hidden lg:block">{dict.header.account}</span>
          </Link>
          <CartButton />
        </div>
      </div>

      <div className="container-site pb-2 md:hidden">
        <SearchBar categories={menu} />
      </div>

      <MegaMenu items={menu} label={dict.header.mainNavigation} />
    </header>
  );
}
