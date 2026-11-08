"use client";

import { useState } from "react";
import { buyNow } from "@/components/cart/actions";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

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
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!available) return null;

  return (
    <div className={className}>
      <button
        type="button"
        disabled={!variantId || pending}
        onClick={async () => {
          if (!variantId) return;
          setPending(true);
          setFailed(false);
          try {
            const { checkoutUrl } = await buyNow(locale, variantId, quantity);
            if (checkoutUrl) {
              window.location.assign(checkoutUrl);
              return;
            }
            setFailed(true);
          } catch (error) {
            console.error("Buy now request failed", error);
            setFailed(true);
          } finally {
            setPending(false);
          }
        }}
        className={cn("btn-dark w-full", pending && "opacity-70")}
      >
        {dict.product.buyNow}
      </button>
      {failed && <p className="mt-2 text-sm text-sale">{dict.cart.error}</p>}
    </div>
  );
}
