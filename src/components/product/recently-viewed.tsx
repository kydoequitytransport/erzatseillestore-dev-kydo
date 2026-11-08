"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useI18n } from "@/i18n/client";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";
import { ProductCard } from "./product-card";

const STORAGE_KEY = "recently-viewed";
/** Product handles, most recent first. */
const MAX_ITEMS = 12;
const listeners = new Set<() => void>();

function readHandles(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeHandles(handles: string[]) {
  try {
    if (handles.length) localStorage.setItem(STORAGE_KEY, handles.join(","));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, quota); the section simply stays empty.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Records a product view; render once on the product page. */
export function TrackProductView({ handle }: { handle: string }) {
  useEffect(() => {
    const handles = readHandles().split(",").filter(Boolean);
    writeHandles([handle, ...handles.filter((h) => h !== handle)].slice(0, MAX_ITEMS));
  }, [handle]);
  return null;
}

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const { locale, dict } = useI18n();
  const stored = useSyncExternalStore(subscribe, readHandles, () => "");
  const handles = stored
    .split(",")
    .filter((h) => h && h !== exclude)
    .slice(0, 5)
    .join(",");
  const [result, setResult] = useState<{ key: string; products: ProductCardType[] }>({ key: "", products: [] });

  useEffect(() => {
    if (!handles) return;
    const key = `${locale}|${handles}`;
    const controller = new AbortController();
    fetch(`/api/products?locale=${locale}&handles=${encodeURIComponent(handles)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data: { products: ProductCardType[] }) => setResult({ key, products: data.products }))
      .catch(() => {});
    return () => controller.abort();
  }, [handles, locale]);

  const products = handles && result.key === `${locale}|${handles}` ? result.products : [];
  if (!products.length) return null;

  return (
    <section className="mt-12 bg-surface py-8 md:mt-14 md:py-10">
      <div className="container-site">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="section-title">{dict.product.recentlyViewed}</h2>
          <button type="button" onClick={() => writeHandles([])} className="text-sm text-brand hover:underline">
            {dict.product.clearHistory}
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-5">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
