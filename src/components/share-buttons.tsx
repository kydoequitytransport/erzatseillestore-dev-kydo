import { FacebookIcon, LinkedInIcon, PinterestIcon, XIcon } from "@/components/icons";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/de";
import { cn } from "@/lib/utils";

export function ShareButtons({
  url,
  title,
  image,
  dict,
  className,
}: {
  url: string;
  title: string;
  image?: string;
  dict: Dictionary["article"];
  className?: string;
}) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const networks = [
    { name: "Facebook", Icon: FacebookIcon, href: `https://www.facebook.com/sharer.php?u=${u}` },
    { name: "X", Icon: XIcon, href: `https://twitter.com/share?url=${u}&text=${t}` },
    { name: "LinkedIn", Icon: LinkedInIcon, href: `https://www.linkedin.com/shareArticle?mini=true&url=${u}&title=${t}` },
    {
      name: "Pinterest",
      Icon: PinterestIcon,
      href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}${image ? `&media=${encodeURIComponent(image)}` : ""}`,
    },
  ];

  return (
    <aside aria-label={dict.share} className={cn("flex items-center gap-3 lg:flex-col lg:items-start", className)}>
      <span className="text-sm font-bold">{dict.share}</span>
      <ul className="flex gap-2">
        {networks.map(({ name, Icon, href }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={format(dict.shareOn, { network: name })}
              className="flex size-8 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark"
            >
              <Icon />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
