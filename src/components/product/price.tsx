"use client";

import { useI18n } from "@/i18n/client";
import type { Money } from "@/lib/shopify/types";
import { cn, formatMoney } from "@/lib/utils";

export function Price({
  price,
  compareAt,
  from,
  size = "md",
  layout = "stacked",
  productDetail = false,
  className,
}: {
  price: Money;
  compareAt?: Money | null;
  from?: boolean;
  size?: "md" | "lg";
  /** `stacked` puts the original price above the current one (cards), `inline` keeps them on one row. */
  layout?: "stacked" | "inline";
  productDetail?: boolean;
  className?: string;
}) {
  const { dict, intl } = useI18n();
  const onSale = !!compareAt && Number(compareAt.amount) > Number(price.amount);

  const original = onSale && (
    <span className={cn("text-muted line-through", size === "lg" ? "text-lg" : "text-[13px]")}>
      <span className="sr-only">{dict.product.originalPrice} </span>
      {formatMoney(compareAt, intl)}
    </span>
  );

  return (
    <div
      className={cn(
        layout === "stacked" ? "flex flex-col" : "flex flex-wrap items-baseline gap-x-3",
        className,
      )}
    >
      {layout === "stacked" && original}
      <span
        className={cn(
          productDetail
            ? "text-[20px] font-normal text-ink"
            : cn(
                "font-bold",
                onSale ? "text-sale" : "text-brand",
                size === "lg" ? "text-[24px] md:text-[26px]" : "text-[16px] md:text-[17px]",
              ),
          layout === "inline" && "order-2",
        )}
      >
        <span className="sr-only">{dict.product.currentPrice} </span>
        {from && <span className="mr-1 text-[0.8em] font-semibold">{dict.product.from}</span>}
        {formatMoney(price, intl)}
      </span>
      {layout === "inline" && original}
    </div>
  );
}
