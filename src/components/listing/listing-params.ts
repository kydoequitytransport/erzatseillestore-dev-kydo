import { getSortOption } from "@/lib/constants";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const all = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

/** Parses listing URL state: ?sort=&after=|before=&page=&filter=<shopify filter input json>&price_min=&price_max= */
export function parseListingParams(params: RawSearchParams) {
  const filterInputs = all(params.filter).filter((f) => {
    try {
      JSON.parse(f);
      return true;
    } catch {
      return false;
    }
  });

  const min = Number(first(params.price_min));
  const max = Number(first(params.price_max));
  const price: { min?: number; max?: number } = {};
  if (Number.isFinite(min) && min > 0) price.min = min;
  if (Number.isFinite(max) && max > 0) price.max = max;

  const filters: Record<string, unknown>[] = filterInputs.map((f) => JSON.parse(f));
  if (price.min !== undefined || price.max !== undefined) filters.push({ price });

  const after = first(params.after) || undefined;
  const before = after ? undefined : first(params.before) || undefined;
  const page = Math.max(1, Math.floor(Number(first(params.page))) || 1);

  return {
    q: first(params.q)?.trim() ?? "",
    sort: getSortOption(first(params.sort)),
    after,
    before,
    page: after || before ? page : 1,
    filterInputs,
    filters,
    price,
  };
}

export type ListingState = ReturnType<typeof parseListingParams>;

/** Builds a listing URL from current state with overrides. Resets pagination unless a cursor is given. */
export function listingHref(
  basePath: string,
  state: ListingState,
  overrides: {
    sort?: string | null;
    after?: string;
    before?: string;
    page?: number;
    filterInputs?: string[];
    price?: ListingState["price"];
  } = {},
) {
  const sp = new URLSearchParams();
  if (state.q) sp.set("q", state.q);
  const sort = overrides.sort !== undefined ? overrides.sort : state.sort.slug;
  if (sort) sp.set("sort", sort);
  for (const f of overrides.filterInputs ?? state.filterInputs) sp.append("filter", f);
  const price = overrides.price ?? state.price;
  if (price.min !== undefined) sp.set("price_min", String(price.min));
  if (price.max !== undefined) sp.set("price_max", String(price.max));
  if (overrides.after) sp.set("after", overrides.after);
  else if (overrides.before) sp.set("before", overrides.before);
  if ((overrides.after || overrides.before) && overrides.page && overrides.page > 1) {
    sp.set("page", String(overrides.page));
  }
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
