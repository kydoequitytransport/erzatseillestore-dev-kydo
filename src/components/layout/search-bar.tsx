"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import { Link, useI18n } from "@/i18n/client";
import type { MenuItem, PredictiveSearchResult } from "@/lib/shopify/types";
import { cn, formatMoney } from "@/lib/utils";

const EMPTY: PredictiveSearchResult = { products: [], collections: [], queries: [] };

function CategoryMenuItem({
  item,
  depth,
  onNavigate,
}: {
  item: MenuItem;
  depth: number;
  onNavigate: () => void;
}) {
  return (
    <li>
      {item.path ? (
        <Link
          href={item.path}
          onClick={onNavigate}
          className="block py-1.5 pr-3 text-[12px] hover:bg-surface hover:text-brand"
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          {item.title}
        </Link>
      ) : (
        <span
          className="block py-2 pr-3 text-[13px] font-bold"
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          {item.title}
        </span>
      )}
      {item.items.length > 0 && (
        <ul>
          {item.items.map((child) => (
            <CategoryMenuItem key={child.title} item={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function SearchBar({
  className,
  autoFocus,
  categories,
}: {
  className?: string;
  autoFocus?: boolean;
  categories: MenuItem[];
}) {
  const router = useRouter();
  const { locale, dict, t, href, intl } = useI18n();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PredictiveSearchResult>(EMPTY);
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}`, {
          signal: controller.signal,
        });
        setResults(await res.json());
      } catch {
        /* aborted or offline */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, locale]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) {
        setOpen(false);
        setCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const hasResults = results.products.length > 0 || results.collections.length > 0;
  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={wrapper} className={cn("relative", className)}>
      <form
        role="search"
        action={href("/search")}
        onSubmit={(e) => {
          e.preventDefault();
          const q = query.trim();
          if (!q) return;
          setOpen(false);
          router.push(href(`/search?q=${encodeURIComponent(q)}`));
        }}
        className="relative flex h-[46px] items-stretch rounded-[3px] border border-[#80808040] bg-white shadow-[0_2px_3px_#8080801c] hover:border-[#cca833] focus-within:border-brand-darker focus-within:shadow-[0_2px_6px_#00000026]"
      >
        <div className="relative shrink-0">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={categoriesOpen}
            onClick={() => setCategoriesOpen((value) => !value)}
            onKeyDown={(e) => e.key === "Escape" && setCategoriesOpen(false)}
            className="flex h-full max-w-[148px] items-center gap-1 border-r border-line bg-[#f7f7f7] px-2 text-[11px] text-brand-dark sm:max-w-[170px] sm:px-3 sm:text-[12px]"
          >
            <span className="truncate">{dict.header.allCategories}</span>
            <ChevronDownIcon className={cn("size-3.5 shrink-0 transition-transform", categoriesOpen && "rotate-180")} />
          </button>
          {categoriesOpen && (
            <nav
              aria-label={dict.header.allCategories}
              className="absolute top-full left-0 z-[60] mt-1 max-h-[70vh] min-w-60 overflow-y-auto rounded-[3px] border border-line bg-white py-1 shadow-[0_4px_14px_#00000024]"
            >
              <Link
                href="/collections"
                onClick={() => setCategoriesOpen(false)}
                className="block border-b border-line px-3 py-2 text-[13px] font-semibold hover:bg-surface"
              >
                {dict.header.allCategories}
              </Link>
              <ul>
                {categories.map((category) => (
                  <CategoryMenuItem
                    key={category.title}
                    item={category}
                    depth={0}
                    onNavigate={() => setCategoriesOpen(false)}
                  />
                ))}
              </ul>
            </nav>
          )}
        </div>
        <input
          type="search"
          name="q"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder={dict.header.searchPlaceholder}
          aria-label={dict.header.search}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showPanel}
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-[13px] outline-none placeholder:text-muted sm:px-4 sm:text-[14px]"
        />
        <button
          type="submit"
          aria-label={dict.header.submitSearch}
          className="my-1 mr-1 flex w-9 shrink-0 items-center justify-center rounded-[3px] bg-brand text-white transition hover:bg-brand-dark sm:w-10"
        >
          <SearchIcon className="size-5" />
        </button>
      </form>

      {showPanel && (
        <div
          id={listId}
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-[3px] border border-line bg-white shadow-[0_3px_7px_#80808029]"
        >
          {!hasResults && (
            <p className="px-4 py-3 text-sm text-muted">{loading ? dict.search.searching : dict.search.noResults}</p>
          )}

          {results.collections.length > 0 && (
            <div className="border-b border-line px-4 py-3">
              <p className="mb-1.5 text-xs font-bold tracking-wide text-muted uppercase">{dict.search.categories}</p>
              <ul className="flex flex-wrap gap-2">
                {results.collections.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/collections/${c.handle}`}
                      onClick={close}
                      className="inline-block rounded-full border border-line px-3 py-1 text-sm hover:border-brand hover:text-brand"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.products.length > 0 && (
            <ul>
              {results.products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.handle}`}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface"
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded bg-surface">
                      {p.featuredImage && (
                        <Image
                          src={p.featuredImage.url}
                          alt={p.featuredImage.altText ?? p.title}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.title}</span>
                      <span className="text-sm font-bold text-brand">
                        {formatMoney(p.priceRange.minVariantPrice, intl)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hasResults && (
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setOpen(false)}
              className="block border-t border-line px-4 py-3 text-sm font-bold hover:text-brand"
            >
              {t(dict.search.showAll, { q: query.trim() })}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
