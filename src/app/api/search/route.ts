import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { predictiveSearch } from "@/lib/shopify";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  const requested = params.get("locale");
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;

  if (q.length < 2) {
    return Response.json({ products: [], collections: [], queries: [] });
  }
  try {
    return Response.json(await predictiveSearch(locale, q.slice(0, 100)));
  } catch (error) {
    console.error("Predictive search failed", error);
    return Response.json({ products: [], collections: [], queries: [] }, { status: 502 });
  }
}
