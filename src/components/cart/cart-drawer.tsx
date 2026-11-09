"use client";

import { Suspense, useEffect } from "react";
import { CloseIcon } from "@/components/icons";
import { Link, useI18n } from "@/i18n/client";
import { cn, formatMoney } from "@/lib/utils";
import { useCart, useCartActions } from "./cart-context";
import { CartLineItem } from "./cart-line-item";

function DrawerBody() {
  const cart = useCart();
  const { close, error, isPending } = useCartActions();
  const { dict, intl, locale } = useI18n();

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold">{dict.cart.empty}</p>
        <Link href="/collections" onClick={close} className="btn-primary">
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className={cn("flex-1 overflow-y-auto px-5", isPending && "opacity-60")}>
        {cart.lines.map((line) => (
          <CartLineItem key={line.id} line={line} onNavigate={close} />
        ))}
      </ul>
      <div className="border-t border-line bg-surface p-5">
        {error && <p className="mb-3 text-sm text-sale">{error}</p>}
        <div className="mb-1 flex justify-between text-base font-bold">
          <span>{dict.cart.subtotal}</span>
          <span>{formatMoney(cart.cost.subtotalAmount, intl)}</span>
        </div>
        <p className="mb-4 text-xs text-muted">{dict.cart.shippingNote}</p>
        <a href={`/api/checkout?locale=${locale}`} className="btn-primary w-full">
          {dict.cart.checkout}
        </a>
        <Link href="/cart" onClick={close} className="btn-secondary mt-2 w-full">
          {dict.cart.viewCart}
        </Link>
      </div>
    </>
  );
}

export function CartDrawer() {
  const { isOpen, close } = useCartActions();
  const { dict } = useI18n();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <div className={cn("fixed inset-0 z-[1200]", !isOpen && "pointer-events-none")} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={cn("absolute inset-0 bg-black/40 transition-opacity", isOpen ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={dict.cart.title}
        inert={!isOpen}
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg">{dict.cart.title}</h2>
          <button type="button" onClick={close} aria-label={dict.cart.close} className="hover:text-brand">
            <CloseIcon className="size-6" />
          </button>
        </div>
        <Suspense fallback={<p className="p-5 text-sm text-muted">{dict.cart.loading}</p>}>
          <DrawerBody />
        </Suspense>
      </aside>
    </div>
  );
}
