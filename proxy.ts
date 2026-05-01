import { NextResponse, type NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  buildLocalizedPath,
  getLocaleFromPathname,
  LOCALE_HEADER,
  resolveLocale,
  stripLocaleFromPathname,
} from "@/lib/i18n";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth-token";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth";

interface MiddlewareEnv {
  AUTH_SESSION_SECRET?: string;
}

async function readSessionSecret(): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as MiddlewareEnv).AUTH_SESSION_SECRET ?? null;
  } catch {
    return null;
  }
}

function withLocaleHeader(
  request: NextRequest,
  locale = resolveLocale(getLocaleFromPathname(request.nextUrl.pathname)),
): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function buildLoginRedirect(request: NextRequest): NextResponse {
  const locale = resolveLocale(getLocaleFromPathname(request.nextUrl.pathname));
  const loginUrl = new URL(buildLocalizedPath(locale, "/login"), request.url);
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (target && target !== buildLocalizedPath(locale)) {
    loginUrl.searchParams.set("redirect", target);
  }
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.headers.set(LOCALE_HEADER, locale);
  return response;
}

export async function proxy(
  request: NextRequest,
): Promise<NextResponse> {
  if (isDevAuthBypassEnabled()) {
    return withLocaleHeader(request);
  }

  const locale = getLocaleFromPathname(request.nextUrl.pathname);
  if (!locale) {
    return withLocaleHeader(request);
  }

  if (stripLocaleFromPathname(request.nextUrl.pathname) === "/login") {
    return withLocaleHeader(request, locale);
  }

  const secret = await readSessionSecret();
  if (!secret) {
    return buildLoginRedirect(request);
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return buildLoginRedirect(request);
  }

  const session = await verifySessionToken(token, secret);
  if (!session) {
    return buildLoginRedirect(request);
  }

  return withLocaleHeader(request, locale);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|js|css|woff|woff2|ttf)).*)",
  ],
};
