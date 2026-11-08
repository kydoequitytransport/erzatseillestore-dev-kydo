import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getProductsByHandle } from "@/lib/shopify";

const HANDLE = /^[\p{L}\p{N}_-]{1,255}$/u;

/** Product cards by handle (`?handles=a,b&locale=de`), used for "recently viewed". */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const requested = params.get("locale");
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  const handles = [...new Set((params.get("handles") ?? "").split(","))].filter((h) => HANDLE.test(h)).slice(0, 12);

  try {
    return Response.json({ products: await getProductsByHandle(locale, handles) });
  } catch (error) {
    console.error("Loading products by handle failed", error);
    return Response.json({ products: [] }, { status: 502 });
  }
}
