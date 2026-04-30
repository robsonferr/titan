import { NextResponse, type NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth-token";

const PUBLIC_PATHS = new Set(["/login"]);

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

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }
  return false;
}

function buildLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (target && target !== "/") {
    loginUrl.searchParams.set("redirect", target);
  }
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function middleware(
  request: NextRequest,
): Promise<NextResponse> {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|js|css|woff|woff2|ttf)).*)",
  ],
};
