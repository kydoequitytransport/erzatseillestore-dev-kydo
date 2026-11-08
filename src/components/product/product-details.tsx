"use client";

import { useMemo, useState } from "react";
import { InvoiceIcon, MinusIcon, PlusIcon, TruckIcon } from "@/components/icons";
import { PaymentBadges } from "@/components/payment-badges";
import { Link, useI18n } from "@/i18n/client";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { cn, discountPercent } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import { BuyNowButton } from "./buy-now-button";
import { Price } from "./price";
import { ProductGallery } from "./product-gallery";

type Selection = Record<string, string>;

function findVariant(variants: ProductVariant[], selection: Selection) {
  return variants.find((v) => v.selectedOptions.every((o) => selection[o.name] === o.value));
}

export function ProductDetails({ product }: { product: Product }) {
  const { dict, t } = useI18n();
  const variants = product.variants.nodes;
  const initial = variants.find((v) => v.availableForSale) ?? variants[0];

  const [selection, setSelection] = useState<Selection>(() =>
    Object.fromEntries(initial?.selectedOptions.map((o) => [o.name, o.value]) ?? []),
  );
  const [quantity, setQuantity] = useState(1);

  const variant = findVariant(variants, selection);
  const images = useMemo(
    () => (product.images.nodes.length ? product.images.nodes : product.featuredImage ? [product.featuredImage] : []),
    [product],
  );

  const activeImage = useMemo(() => {
    if (!variant?.image) return 0;
    const i = images.findIndex((img) => img.url === variant.image?.url);
    return i === -1 ? 0 : i;
  }, [variant, images]);

  const isValueAvailable = (optionName: string, value: string) =>
    variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) => (o.name === optionName ? o.value === value : selection[o.name] === o.value)),
    );

  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice ?? null;
  const discount = discountPercent(price, compareAt);
  const available = !!variant?.availableForSale;
  const maxQty = variant?.quantityAvailable && variant.quantityAvailable > 0 ? variant.quantityAvailable : 99;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12 xl:gap-16">
      <ProductGallery images={images} active={activeImage} title={product.title} />

      <div>
        <h1 className="mb-2 text-[24px] leading-tight font-bold md:text-[30px]">{product.title}</h1>
        {product.vendor && (
          <p className="mb-4 text-sm">
            {dict.product.by}{" "}
            <Link href={`/search?q=${encodeURIComponent(product.vendor)}`} className="text-brand hover:underline">
              {product.vendor}
            </Link>
          </p>
        )}

        <div className="mb-5 flex flex-wrap items-center gap-3">
          {!available && (
            <span className="bg-black px-2 py-1 text-xs font-bold text-white">{dict.product.soldOut}</span>
          )}
          {discount > 0 && (
            <span className="rounded-[3px] bg-sale px-2 py-1 text-xs font-bold text-white">
              {t(dict.product.save, { n: discount })}
            </span>
          )}
          <Price price={price} compareAt={compareAt} layout="inline" productDetail />
        </div>

        {!product.hasOnlyDefaultVariant &&
          product.options.map((option) => (
            <fieldset key={option.id} className="mb-5">
              <legend className="mb-2 text-sm font-bold">
                {option.name}: <span className="font-normal">{selection[option.name]}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {option.optionValues.map(({ name }) => {
                  const selected = selection[option.name] === name;
                  const possible = isValueAvailable(option.name, name);
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelection((s) => ({ ...s, [option.name]: name }))}
                      className={cn(
                        "min-w-12 rounded-[3px] border px-4 py-2 text-sm transition",
                        selected ? "border-brand bg-brand-light font-bold" : "border-line hover:border-ink",
                        !possible && "text-muted line-through decoration-1",
                      )}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

        <label htmlFor="product-quantity" className="mb-2 block text-sm font-bold">
          {dict.product.quantity}
        </label>
        <div className="mb-3 flex gap-3">
          <div className="flex h-[56px] w-[204px] shrink-0 items-center border border-brand">
            <button
              type="button"
              aria-label={dict.product.decrease}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-full w-[50px] items-center justify-center text-brand hover:bg-brand-light"
            >
              <MinusIcon className="size-4" />
            </button>
            <input
              id="product-quantity"
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
              className="min-w-0 flex-1 text-center font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              aria-label={dict.product.increase}
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="flex h-full w-[50px] items-center justify-center text-brand hover:bg-brand-light"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
          <AddToCartButton
            variantId={variant?.id}
            quantity={quantity}
            available={available}
            productDetail
            className="flex-1"
          />
        </div>
        <BuyNowButton variantId={variant?.id} quantity={quantity} available={available} />

        <div className="mt-2 text-center">
          <a href="#payment-options" className="text-sm text-brand hover:underline">
            {dict.product.morePaymentOptions}
          </a>
        </div>

        <div id="payment-options" className="mt-6 text-center scroll-mt-24">
          <p className="mb-3 text-[15px] font-bold">{dict.product.securePayment}</p>
          <PaymentBadges label={dict.product.securePayment} className="justify-center" />
        </div>

        <ul className="mt-6 space-y-2 text-sm">
          <li className="flex items-center gap-3 rounded-[3px] bg-surface px-4 py-3">
            <TruckIcon className="size-5 shrink-0 text-brand" />
            {dict.product.freeShipping}
          </li>
          <li className="flex items-center gap-3 rounded-[3px] bg-surface px-4 py-3">
            <InvoiceIcon className="size-5 shrink-0 text-brand" />
            {dict.product.invoice}
          </li>
        </ul>

        {product.descriptionHtml && (
          <section className="mt-8">
            <h2 className="mb-4 text-[22px] font-bold">{dict.product.information}</h2>
            <div className="rte" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </section>
        )}
      </div>
    </div>
  );
}
