"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { Link, useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export type Slide = {
  title: string;
  text: string;
  href: string;
  cta: string;
  image: { url: string; alt: string } | null;
};

const INTERVAL_MS = 5000;

export function Slideshow({ slides }: { slides: Slide[] }) {
  const { dict, t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  if (!count) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={dict.home.carousel}
      className="group relative overflow-hidden bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[280px] sm:h-[360px] lg:h-[min(34vw,500px)]">
        {slides.map((slide, i) => (
          <div
            key={slide.href + i}
            role="group"
            aria-roledescription="slide"
            aria-label={t(dict.home.slideOf, { n: i + 1, total: count })}
            aria-hidden={i !== index}
            inert={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "z-10 opacity-100" : "z-0 opacity-0",
            )}
          >
            {slide.image && (
              <Image
                src={slide.image.url}
                alt={slide.image.alt}
                fill
                preload={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
            <div className="container-site relative flex h-full items-center">
              <div className="max-w-xl text-white">
                <h2 className="mb-3 text-[28px] leading-tight font-bold md:text-5xl">{slide.title}</h2>
                <p className="mb-6 line-clamp-3 text-[15px] md:text-lg">{slide.text}</p>
                <Link href={slide.href} className="btn-primary">
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={dict.home.previousSlide}
            className="absolute top-1/2 left-3 z-20 hidden -translate-y-1/2 rounded-full bg-white/85 p-2 text-ink opacity-0 shadow transition group-hover:opacity-100 hover:bg-white md:block"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={dict.home.nextSlide}
            className="absolute top-1/2 right-3 z-20 hidden -translate-y-1/2 rounded-full bg-white/85 p-2 text-ink opacity-0 shadow transition group-hover:opacity-100 hover:bg-white md:block"
          >
            <ChevronRightIcon className="size-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={t(dict.home.slide, { n: i + 1 })}
                aria-current={i === index || undefined}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === index ? "w-7 bg-brand" : "w-2.5 bg-white/80 hover:bg-white",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
