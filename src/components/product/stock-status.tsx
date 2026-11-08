"use client";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 5;

export function StockStatus({
  available,
  quantity,
  className,
}: {
  available: boolean;
  quantity?: number | null;
  className?: string;
}) {
  const { dict, t } = useI18n();
  let label = dict.product.inStock;
  let tone = "bg-success";

  if (!available) {
    label = dict.product.soldOut;
    tone = "bg-sale";
  } else if (quantity != null && quantity <= 0) {
    label = dict.product.backorder;
    tone = "bg-warning";
  } else if (quantity != null && quantity <= LOW_STOCK_THRESHOLD) {
    label = t(dict.product.onlyLeft, { n: quantity });
    tone = "bg-warning";
  }

  return (
    <p className={cn("flex items-center gap-2 text-sm", className)}>
      <span className={cn("size-2.5 shrink-0 rounded-full", tone)} aria-hidden />
      {label}
    </p>
  );
}
