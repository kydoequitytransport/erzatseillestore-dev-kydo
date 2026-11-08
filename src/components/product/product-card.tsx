"use client";

import Image from "next/image";
import { Link, useI18n } from "@/i18n/client";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";
import { cn, discountPercent } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import { Price } from "./price";
import { StockStatus } from "./stock-status";

const CARD_SIZES = "(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw";

export function ProductCard({
  product,
  className,
  preload,
}: {
  product: ProductCardType;
  className?: string;
  preload?: boolean;
}) {
  const { dict, t } = useI18n();
  const href = `/products/${product.handle}`;
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  const compareAt = product.compareAtPriceRange.maxVariantPrice;
  const discount = discountPercent(minVariantPrice, compareAt);
  const firstVariant = product.variants.nodes[0];
  const image = product.featuredImage;
  const hoverImage = product.images.nodes.find((img) => img.url !== image?.url);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border border-line bg-white p-2 transition-shadow hover:shadow-[0_2px_10px_#0000001f] sm:p-2.5",
        className,
      )}
    >
      <Link href={href} className="relative mb-2 block aspect-square overflow-hidden bg-white" tabIndex={-1}>
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              preload={preload}
              sizes={CARD_SIZES}
              className={cn("object-contain transition-opacity duration-300", hoverImage && "group-hover:opacity-0")}
            />
            {hoverImage && (
              <Image
                src={hoverImage.url}
                alt=""
                fill
                sizes={CARD_SIZES}
                className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <span className="absolute inset-0 bg-surface" />
        )}
        {discount > 0 && (
          <span className="absolute top-0 left-0 rounded-[3px] bg-sale px-1.5 py-0.5 text-[11px] font-bold text-white sm:px-2 sm:py-1 sm:text-xs">
            {t(dict.product.save, { n: discount })}
          </span>
        )}
        {!product.availableForSale && (
          <span className="absolute top-0 right-0 rounded-[3px] bg-ink px-2 py-1 text-xs font-bold text-white">
            {dict.product.soldOut}
          </span>
        )}
      </Link>

      <Price
        price={minVariantPrice}
        compareAt={compareAt}
        from={minVariantPrice.amount !== maxVariantPrice.amount}
        className="mb-1.5"
      />
      <h3 className="mb-1 font-sans text-[12px] leading-snug font-normal tracking-normal sm:text-[13px]">
        <Link href={href} className="line-clamp-3 hover:text-brand">
          {product.title}
        </Link>
      </h3>
      {product.vendor && <p className="mb-1 text-[11px] text-muted">{product.vendor}</p>}
      <StockStatus
        available={product.availableForSale}
        quantity={firstVariant?.quantityAvailable}
        className="mb-2 text-[11px]"
      />

      <div className="mt-auto transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
        {product.hasOnlyDefaultVariant ? (
          <AddToCartButton variantId={firstVariant?.id} available={product.availableForSale} compact />
        ) : (
          <Link href={href} className="btn-secondary w-full px-3 py-2.5 text-[13px]">
            {dict.product.chooseOptions}
          </Link>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ products, className }: { products: ProductCardType[]; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4", className)}>
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard product={product} preload={i < 4} />
        </li>
      ))}
    </ul>
  );
}
