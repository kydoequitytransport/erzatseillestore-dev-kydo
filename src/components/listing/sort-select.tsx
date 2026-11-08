"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelect({ value, hrefs }: { value: string | null; hrefs: Record<string, string> }) {
  const router = useRouter();
  const { dict, href } = useI18n();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden sm:inline">{dict.listing.sortBy}</span>
      <select
        value={value ?? ""}
        aria-label={dict.listing.sortBy}
        onChange={(e) => router.push(href(hrefs[e.target.value]))}
        className="h-10 max-w-[200px] rounded-[3px] border border-line bg-white px-3 text-sm outline-none focus:border-brand sm:max-w-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.slug ?? ""} value={o.slug ?? ""}>
            {dict.listing.sort[(o.slug ?? "default") as keyof typeof dict.listing.sort]}
          </option>
        ))}
      </select>
    </label>
  );
}
