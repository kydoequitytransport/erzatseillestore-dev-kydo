"use client";

import { useI18n } from "@/i18n/client";

export function BuyNowButton({
  variantId,
  quantity,
  available,
  className,
}: {
  variantId: string | undefined;
  quantity: number;
  available: boolean;
  className?: string;
}) {
  const { locale, dict } = useI18n();

  if (!available) return null;

  return (
    <form action="/api/checkout" method="get" className={className}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="mode" value="buy-now" />
      <input type="hidden" name="variantId" value={variantId ?? ""} />
      <input type="hidden" name="quantity" value={quantity} />
      <button type="submit" disabled={!variantId} className="btn-dark w-full">
        {dict.product.buyNow}
      </button>
    </form>
  );
}
