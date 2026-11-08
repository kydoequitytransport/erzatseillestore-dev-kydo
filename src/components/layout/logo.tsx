import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted, label }: { className?: string; inverted?: boolean; label: string }) {
  const [, word = siteConfig.name, digits = ""] = siteConfig.name.match(/^(.*?)(\d*)$/) ?? [];
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} – ${label}`}
      className={cn(
        "font-heading text-[24px] font-extrabold uppercase leading-none tracking-[0.04em] sm:text-[26px] md:text-[32px]",
        inverted ? "text-white" : "text-ink",
        className,
      )}
    >
      {word}
      <span className="text-brand">{digits}</span>
    </Link>
  );
}
