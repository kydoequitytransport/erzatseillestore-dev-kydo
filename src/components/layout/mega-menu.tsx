import { ChevronDownIcon } from "@/components/icons";
import { Link } from "@/i18n/client";
import type { MenuItem } from "@/lib/shopify";
import { cn } from "@/lib/utils";

function MenuLink({ item, className }: { item: MenuItem; className?: string }) {
  if (!item.path) return <span className={className}>{item.title}</span>;
  return (
    <Link href={item.path} className={cn("hover:text-brand", className)}>
      {item.title}
    </Link>
  );
}

function MenuChildren({ items, depth = 0 }: { items: MenuItem[]; depth?: number }) {
  if (!items.length) return null;
  return (
    <ul className={depth === 0 ? "space-y-1.5" : "mt-1 space-y-1 border-l border-line pl-3"}>
      {items.map((item) => (
        <li key={item.title}>
          <MenuLink
            item={item}
            className={cn(
              "block leading-snug",
              depth === 0 ? "text-[13px] text-ink/80" : "text-[12px] text-muted",
              !item.path && "font-semibold text-ink",
            )}
          />
          <MenuChildren items={item.items} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

function MegaPanel({ items }: { items: MenuItem[] }) {
  return (
    <div className="invisible absolute inset-x-0 top-full z-50 border-t border-line bg-white opacity-0 shadow-[0_8px_16px_#0000001a] transition-[opacity,visibility] delay-100 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <ul className="container-site grid max-h-[calc(100vh-220px)] grid-cols-4 gap-x-8 gap-y-7 overflow-y-auto py-8 xl:grid-cols-5">
        {items.map((column) => (
          <li key={column.title}>
            <MenuLink item={column} className="mb-2 block text-[15px] font-bold" />
            <MenuChildren items={column.items} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MegaMenu({ items, label }: { items: MenuItem[]; label: string }) {
  return (
    <nav aria-label={label} className="relative hidden border-t border-line lg:block">
      <ul className="container-site flex flex-wrap items-stretch gap-x-5 text-[12px] xl:justify-between xl:gap-x-3 xl:text-[13px]">
        {items.map((item) => (
          <li key={item.title} className="group">
            {item.items.length > 0 ? (
              <>
                <button
                  type="button"
                  aria-haspopup="true"
                  className="flex h-full items-center gap-1 py-2.5 text-left font-bold transition-colors group-hover:text-brand group-focus-within:text-brand"
                >
                  {item.title}
                  <ChevronDownIcon className="size-4 shrink-0 transition-transform group-hover:rotate-180" />
                </button>
                <MegaPanel items={item.items} />
              </>
            ) : (
              <MenuLink item={item} className="flex h-full items-center py-2.5 font-bold" />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
