"use client";

import { createContext, use, useCallback, useMemo, useState, useTransition } from "react";
import { useI18n } from "@/i18n/client";
import type { Cart } from "@/lib/shopify/types";
import { addToCart, removeLine, updateLineQuantity, type CartActionResult } from "./actions";

type CartContextValue = {
  cartPromise: Promise<Cart | null>;
  override: Cart | null | undefined;
  isOpen: boolean;
  isPending: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  cartPromise,
  children,
}: {
  cartPromise: Promise<Cart | null>;
  children: React.ReactNode;
}) {
  const { locale, dict } = useI18n();
  const [override, setOverride] = useState<Cart | null | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const apply = useCallback(
    (result: CartActionResult) => {
      if (result.error) {
        setError(dict.cart.error);
        return false;
      }
      setError(null);
      setOverride(result.cart);
      return true;
    },
    [dict],
  );

  const run = useCallback(
    async (action: () => Promise<CartActionResult>) => {
      try {
        return apply(await action());
      } catch (reason) {
        console.error("Cart request failed", reason);
        setError(dict.cart.error);
        return false;
      }
    },
    [apply, dict.cart.error],
  );

  const addItem = useCallback(
    (variantId: string, quantity = 1) =>
      new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const ok = await run(() => addToCart(locale, variantId, quantity));
          if (ok) setIsOpen(true);
          resolve(ok);
        });
      }),
    [locale, run],
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      startTransition(async () => {
        await run(() => updateLineQuantity(locale, lineId, quantity));
      });
    },
    [locale, run],
  );

  const removeItem = useCallback(
    (lineId: string) => {
      startTransition(async () => {
        await run(() => removeLine(locale, lineId));
      });
    },
    [locale, run],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartPromise,
      override,
      isOpen,
      isPending,
      error,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
    }),
    [cartPromise, override, isOpen, isPending, error, addItem, updateQuantity, removeItem],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

/** Cart actions and UI state. Safe to use outside <Suspense>. */
export function useCartActions() {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCartActions must be used within <CartProvider>");
  return ctx;
}

/** Current cart. Suspends until the request-time cart is loaded. */
export function useCart() {
  const ctx = useCartActions();
  const initial = use(ctx.cartPromise);
  return ctx.override !== undefined ? ctx.override : initial;
}
