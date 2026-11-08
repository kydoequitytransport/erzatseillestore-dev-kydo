"use client";

import { Suspense } from "react";
import { CartIcon } from "@/components/icons";
import { useI18n } from "@/i18n/client";
import { useCart, useCartActions } from "./cart-context";

function CartCount() {
  const cart = useCart();
  const count = cart?.totalQuantity ?? 0;
  if (!count) return null;
  return (
    <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function CartButton() {
  const { open } = useCartActions();
  const { dict } = useI18n();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={dict.header.openCart}
      className="flex flex-col items-center gap-0.5 text-[13px] font-bold hover:text-brand"
    >
      <span className="relative">
        <CartIcon className="size-7" />
        <Suspense fallback={null}>
          <CartCount />
        </Suspense>
      </span>
      <span className="hidden lg:block">{dict.header.cart}</span>
    </button>
  );
}
