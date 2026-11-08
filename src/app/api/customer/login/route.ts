import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { shopifyConfig } from "@/lib/shopify/config";

const FLOW_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/api/customer",
  maxAge: 600,
};

type OpenIdConfiguration = {
  issuer: string;
  authorization_endpoint: string;
};

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const callbackUri = shopifyConfig.customerAccountRedirectUri;
  const callbackUrl = callbackUri ? new URL(callbackUri) : null;

  if (
    !shopifyConfig.customerAccountClientId ||
    !callbackUrl ||
    callbackUrl.protocol !== "https:" ||
    callbackUrl.pathname !== "/api/customer/callback" ||
    callbackUrl.origin !== request.nextUrl.origin
  ) {
    return NextResponse.redirect(new URL(`/${locale}/account/login?error=setup`, request.url));
  }

  try {
    const configResponse = await fetch(`https://${shopifyConfig.domain}/.well-known/openid-configuration`, {
      cache: "no-store",
    });
    if (!configResponse.ok) throw new Error(`OpenID discovery failed: ${configResponse.status}`);
    const configuration = (await configResponse.json()) as OpenIdConfiguration;
    if (!configuration.issuer.startsWith("https://") || !configuration.authorization_endpoint.startsWith("https://")) {
      throw new Error("Shopify returned an invalid OpenID configuration");
    }

    const state = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    const verifier = randomBytes(32).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const authorizeUrl = new URL(configuration.authorization_endpoint);

    authorizeUrl.searchParams.set("client_id", shopifyConfig.customerAccountClientId);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("redirect_uri", callbackUri);
    authorizeUrl.searchParams.set("scope", "openid email customer-account-api:full");
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("nonce", nonce);
    authorizeUrl.searchParams.set("code_challenge", challenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");
    authorizeUrl.searchParams.set("locale", locale);
    authorizeUrl.searchParams.set("region_country", shopifyConfig.country);

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set("customer_oauth_state", state, FLOW_COOKIE_OPTIONS);
    response.cookies.set("customer_oauth_nonce", nonce, FLOW_COOKIE_OPTIONS);
    response.cookies.set("customer_oauth_verifier", verifier, FLOW_COOKIE_OPTIONS);
    response.cookies.set("customer_oauth_locale", locale, FLOW_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error("Could not start Shopify customer authentication", error);
    return NextResponse.redirect(new URL(`/${locale}/account/login?error=auth`, request.url));
  }
}
