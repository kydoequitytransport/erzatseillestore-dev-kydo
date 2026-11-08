"use client";

import { useState } from "react";
import { useCartActions } from "@/components/cart/cart-context";
import { CartIcon } from "@/components/icons";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  variantId,
  quantity = 1,
  available,
  className,
  compact,
  productDetail,
}: {
  variantId: string | undefined;
  quantity?: number;
  available: boolean;
  className?: string;
  compact?: boolean;
  productDetail?: boolean;
}) {
  const { addItem, error, isPending: cartPending } = useCartActions();
  const { dict } = useI18n();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const disabled = !available || !variantId || pending || cartPending;

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={async () => {
          if (!variantId) return;
          setPending(true);
          setFailed(!(await addItem(variantId, quantity)));
          setPending(false);
        }}
        className={cn(
          productDetail
            ? "btn border-line bg-white text-brand hover:border-brand hover:bg-white"
            : available
              ? "btn-primary"
              : "btn-secondary",
          "w-full",
          compact && "px-3 py-2.5 text-[13px]",
          productDetail && "h-[56px] rounded-none text-base",
        )}
      >
        {!compact && !productDetail && available && <CartIcon className="size-5" />}
        {!available ? dict.product.soldOut : pending ? dict.product.adding : dict.product.addToCart}
      </button>
      {failed && error && <p className="mt-2 text-sm text-sale">{error}</p>}
    </div>
  );
}
