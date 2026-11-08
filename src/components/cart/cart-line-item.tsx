"use client";

import Image from "next/image";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Link, useI18n } from "@/i18n/client";
import type { CartLine } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/utils";
import { useCartActions } from "./cart-context";

export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const { updateQuantity, removeItem, isPending } = useCartActions();
  const { dict, intl } = useI18n();
  const { merchandise } = line;
  const image = merchandise.image ?? merchandise.product.featuredImage;
  const options = merchandise.selectedOptions.filter((o) => o.value !== "Default Title");
  const maxQty =
    merchandise.availableForSale && (!merchandise.quantityAvailable || merchandise.quantityAvailable < 1)
      ? Infinity
      : (merchandise.quantityAvailable ?? line.quantity);
  const href = `/products/${merchandise.product.handle}`;

  return (
    <li className="flex gap-4 border-b border-line py-4">
      <Link
        href={href}
        onClick={onNavigate}
        className="relative size-20 shrink-0 overflow-hidden rounded-[3px] border border-line bg-white"
      >
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? merchandise.product.title}
            fill
            sizes="80px"
            className="object-contain p-1"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link href={href} onClick={onNavigate} className="text-sm leading-snug font-semibold hover:text-brand">
          {merchandise.product.title}
        </Link>
        {options.length > 0 && (
          <p className="text-xs text-muted">{options.map((o) => `${o.name}: ${o.value}`).join(" · ")}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex h-9 items-center rounded-[3px] border border-line">
            <button
              type="button"
              aria-label={dict.product.decrease}
              disabled={isPending}
              onClick={() => updateQuantity(line.id, line.quantity - 1)}
              className="flex h-full w-8 items-center justify-center hover:text-brand disabled:opacity-50"
            >
              <MinusIcon className="size-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
            <button
              type="button"
              aria-label={dict.product.increase}
              disabled={isPending || line.quantity >= maxQty}
              onClick={() => updateQuantity(line.id, line.quantity + 1)}
              className="flex h-full w-8 items-center justify-center hover:text-brand disabled:opacity-50"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>

          <span className="text-sm font-bold">{formatMoney(line.cost.totalAmount, intl)}</span>

          <button
            type="button"
            aria-label={dict.cart.remove}
            disabled={isPending}
            onClick={() => removeItem(line.id)}
            className="text-muted hover:text-sale disabled:opacity-50"
          >
            <TrashIcon className="size-5" />
          </button>
        </div>
      </div>
    </li>
  );
}
