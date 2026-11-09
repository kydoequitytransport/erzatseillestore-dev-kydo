"use client";

import { useSearchParams } from "next/navigation";
import { useCart, useCartActions } from "@/components/cart/cart-context";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { Link, useI18n } from "@/i18n/client";
import { cn, formatMoney } from "@/lib/utils";

export function CartView() {
  const cart = useCart();
  const { isPending, error } = useCartActions();
  const searchParams = useSearchParams();
  const { dict, intl, locale } = useI18n();
  const checkoutError = searchParams.get("checkout") === "error";

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="py-16 text-center">
        {checkoutError && <p role="alert" className="mb-4 text-sm text-sale">{dict.cart.checkoutError}</p>}
        <p className="mb-6 text-lg">{dict.cart.empty}</p>
        <Link href="/collections" className="btn-primary">
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <ul className={cn("border-t border-line", isPending && "opacity-60")}>
        {cart.lines.map((line) => (
          <CartLineItem key={line.id} line={line} />
        ))}
      </ul>

      <aside className="h-fit rounded-[3px] bg-surface p-6">
        <h2 className="mb-4 text-lg">{dict.cart.summary}</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>{dict.cart.subtotal}</dt>
            <dd>{formatMoney(cart.cost.subtotalAmount, intl)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{dict.cart.shipping}</dt>
            <dd>{dict.cart.shippingAtCheckout}</dd>
          </div>
          {cart.cost.totalTaxAmount && Number(cart.cost.totalTaxAmount.amount) > 0 && (
            <div className="flex justify-between">
              <dt>{dict.cart.vat}</dt>
              <dd>{formatMoney(cart.cost.totalTaxAmount, intl)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
            <dt>{dict.cart.total}</dt>
            <dd>{formatMoney(cart.cost.totalAmount, intl)}</dd>
          </div>
        </dl>
        {checkoutError && <p role="alert" className="mt-3 text-sm text-sale">{dict.cart.checkoutError}</p>}
        {error && <p className="mt-3 text-sm text-sale">{error}</p>}
        <a href={`/api/checkout?locale=${locale}`} className="btn-primary mt-6 w-full">
          {dict.cart.checkout}
        </a>
        <p className="mt-3 text-center text-xs text-muted">{dict.cart.secureCheckout}</p>
      </aside>
    </div>
  );
}
