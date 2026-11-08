import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { shopifyConfig } from "@/lib/shopify/config";

const FLOW_COOKIE_NAMES = [
  "customer_oauth_state",
  "customer_oauth_nonce",
  "customer_oauth_verifier",
  "customer_oauth_locale",
] as const;

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

type OpenIdConfiguration = {
  issuer: string;
  token_endpoint: string;
  jwks_uri: string;
};

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
};

function clearFlowCookies(response: NextResponse) {
  for (const name of FLOW_COOKIE_NAMES) {
    response.cookies.set(name, "", { ...AUTH_COOKIE_OPTIONS, path: "/api/customer", maxAge: 0 });
  }
}

function failureResponse(request: NextRequest, locale: string) {
  const response = NextResponse.redirect(new URL(`/${locale}/account/login?error=auth`, request.url));
  clearFlowCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const localeValue = cookieStore.get("customer_oauth_locale")?.value;
  const locale = isLocale(localeValue) ? localeValue : DEFAULT_LOCALE;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const issuer = request.nextUrl.searchParams.get("iss");
  const expectedState = cookieStore.get("customer_oauth_state")?.value;
  const nonce = cookieStore.get("customer_oauth_nonce")?.value;
  const verifier = cookieStore.get("customer_oauth_verifier")?.value;
  const callbackUri = shopifyConfig.customerAccountRedirectUri;

  if (
    request.nextUrl.searchParams.has("error") ||
    !code ||
    !state ||
    !issuer ||
    !expectedState ||
    state !== expectedState ||
    !nonce ||
    !verifier ||
    !shopifyConfig.customerAccountClientId ||
    !callbackUri
  ) {
    return failureResponse(request, locale);
  }

  try {
    const discoveryResponse = await fetch(`https://${shopifyConfig.domain}/.well-known/openid-configuration`, {
      cache: "no-store",
    });
    if (!discoveryResponse.ok) throw new Error(`OpenID discovery failed: ${discoveryResponse.status}`);
    const configuration = (await discoveryResponse.json()) as OpenIdConfiguration;
    if (issuer !== configuration.issuer) throw new Error("Shopify OAuth issuer mismatch");

    const tokenResponse = await fetch(configuration.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: shopifyConfig.customerAccountClientId,
        code,
        redirect_uri: callbackUri,
        code_verifier: verifier,
      }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) throw new Error(`Shopify token exchange failed: ${tokenResponse.status}`);
    const tokens = (await tokenResponse.json()) as TokenResponse;
    if (!tokens.access_token || !tokens.id_token || !tokens.expires_in) {
      throw new Error(tokens.error ?? "Shopify returned an incomplete token response");
    }

    const jwks = createRemoteJWKSet(new URL(configuration.jwks_uri));
    const { payload } = await jwtVerify(tokens.id_token, jwks, {
      issuer: configuration.issuer,
      audience: shopifyConfig.customerAccountClientId,
    });
    if (payload.nonce !== nonce) throw new Error("Shopify customer authentication nonce mismatch");
    if (typeof payload.email !== "string" || payload.email_verified !== true) {
      throw new Error("Shopify did not return a verified customer email");
    }

    const response = NextResponse.redirect(new URL(`/${locale}/account`, request.url));
    clearFlowCookies(response);
    response.cookies.set("shopify_customer_access_token", tokens.access_token, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: Math.min(tokens.expires_in, 60 * 60 * 24),
    });
    response.cookies.set("shopify_customer_email", payload.email, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: Math.min(tokens.expires_in, 60 * 60 * 24),
    });
    return response;
  } catch (error) {
    console.error("Shopify customer authentication callback failed", error);
    return failureResponse(request, locale);
  }
}
