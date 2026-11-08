"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { Link, useI18n } from "@/i18n/client";
import type { MenuItem } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

const LEVEL_STYLES = [
  "py-3 text-[15px] font-bold",
  "py-2.5 text-[15px] font-semibold",
  "py-2 text-[14px] text-ink/80",
];

function MenuSection({
  item,
  depth,
  onNavigate,
  viewAll,
}: {
  item: MenuItem;
  depth: number;
  onNavigate: () => void;
  viewAll: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const style = LEVEL_STYLES[Math.min(depth, LEVEL_STYLES.length - 1)];

  if (!item.items.length) {
    return item.path ? (
      <Link href={item.path} onClick={onNavigate} className={cn("block hover:text-brand", style)}>
        {item.title}
      </Link>
    ) : (
      <span className={cn("block", style)}>{item.title}</span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn("flex w-full items-center justify-between gap-3 text-left", style)}
      >
        {item.title}
        <ChevronDownIcon className={cn("size-5 shrink-0 transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && (
        <ul className={cn("pl-4", depth === 0 ? "pb-2" : "pb-1")}>
          {item.path && (
            <li>
              <Link
                href={item.path}
                onClick={onNavigate}
                className="block py-2 text-[14px] text-brand underline-offset-2 hover:underline"
              >
                {viewAll}
              </Link>
            </li>
          )}
          {item.items.map((child) => (
            <li key={child.title}>
              <MenuSection item={child} depth={depth + 1} onNavigate={onNavigate} viewAll={viewAll} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MobileMenu({ items }: { items: MenuItem[] }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={dict.header.openMenu} className="lg:hidden">
        <MenuIcon className="size-7" />
      </button>

      <div className={cn("fixed inset-0 z-[1200] lg:hidden", !open && "pointer-events-none")}>
        <div
          onClick={close}
          className={cn("absolute inset-0 bg-black/40 transition-opacity", open ? "opacity-100" : "opacity-0")}
        />
        <nav
          aria-label={dict.header.mobileNavigation}
          inert={!open}
          className={cn(
            "absolute top-0 left-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="font-heading text-lg font-semibold">{dict.header.menu}</span>
            <button type="button" onClick={close} aria-label={dict.header.closeMenu}>
              <CloseIcon className="size-6" />
            </button>
          </div>
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
            {items.map((item) => (
              <li key={item.title}>
                <MenuSection item={item} depth={0} onNavigate={close} viewAll={dict.header.viewAll} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
