"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ZoomIcon } from "@/components/icons";
import { useI18n } from "@/i18n/client";
import type { Image as ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

function Lightbox({
  images,
  index,
  title,
  onIndex,
  onClose,
}: {
  images: ShopifyImage[];
  index: number;
  title: string;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const { dict } = useI18n();
  const count = images.length;
  const image = images[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
      if (e.key === "ArrowRight") onIndex((index + 1) % count);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, count, onIndex, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[1300] bg-white">
      <Image
        key={image.url}
        src={image.url}
        alt={image.altText ?? title}
        fill
        sizes="100vw"
        quality={90}
        className="object-contain p-4 md:p-12"
      />
      <button
        type="button"
        autoFocus
        onClick={onClose}
        aria-label={dict.product.closeZoom}
        className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white shadow-md hover:text-brand"
      >
        <CloseIcon className="size-6" />
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => onIndex((index - 1 + count) % count)}
            aria-label={dict.product.previousImage}
            className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:text-brand"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => onIndex((index + 1) % count)}
            aria-label={dict.product.nextImage}
            className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:text-brand"
          >
            <ChevronRightIcon className="size-6" />
          </button>
        </>
      )}
    </div>
  );
}

export function ProductGallery({ images, active, title }: { images: ShopifyImage[]; active: number; title: string }) {
  const { dict, t } = useI18n();
  const [index, setIndex] = useState(active);
  const [lastActive, setLastActive] = useState(active);
  const [zoomed, setZoomed] = useState(false);
  const closeZoom = useCallback(() => setZoomed(false), []);
  if (active !== lastActive) {
    setLastActive(active);
    setIndex(active);
  }
  const current = images[index] ?? images[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-white">
        {current ? (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="group absolute inset-0 cursor-zoom-in"
            aria-label={dict.product.enlarge}
          >
            <Image
              key={current.url}
              src={current.url}
              alt={current.altText ?? title}
              fill
              preload
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain"
            />
            <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-[3px] bg-white/90 px-2.5 py-1.5 text-[12px] text-ink shadow-sm transition group-hover:text-brand">
              <ZoomIcon className="size-4" />
              {dict.product.enlarge}
            </span>
          </button>
        ) : (
          <div className="absolute inset-0 bg-surface" />
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <li key={img.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t(dict.product.showImage, { n: i + 1 })}
                aria-current={i === index || undefined}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-[3px] border-2 bg-white md:size-20",
                  i === index ? "border-brand" : "border-line hover:border-neutral-400",
                )}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {zoomed && current && (
        <Lightbox images={images} index={index} title={title} onIndex={setIndex} onClose={closeZoom} />
      )}
    </div>
  );
}
