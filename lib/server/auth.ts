import "server-only";

import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  constantTimeEqualBytes,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth-token";

interface AuthEnv {
  AUTH_PASSWORD?: string;
  AUTH_SESSION_SECRET?: string;
}

class AuthConfigError extends Error {
  constructor() {
    super("TITAN_AUTH_NOT_CONFIGURED");
  }
}

class AuthSessionError extends Error {
  constructor() {
    super("TITAN_AUTH_REQUIRED");
  }
}

async function getAuthEnv(): Promise<AuthEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env as unknown as AuthEnv;
}

export async function verifyPassword(input: string): Promise<boolean> {
  const env = await getAuthEnv();

  if (!env.AUTH_PASSWORD) {
    throw new AuthConfigError();
  }

  const expected = new TextEncoder().encode(env.AUTH_PASSWORD);
  const provided = new TextEncoder().encode(input);

  if (expected.length !== provided.length) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return false;
  }

  const ok = constantTimeEqualBytes(expected, provided);
  if (!ok) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return ok;
}

export async function createSessionCookie(): Promise<void> {
  const env = await getAuthEnv();

  if (!env.AUTH_SESSION_SECRET) {
    throw new AuthConfigError();
  }

  const now = Math.floor(Date.now() / 1000);
  const token = await signSessionToken(
    { sub: "owner", exp: now + SESSION_TTL_SECONDS },
    env.AUTH_SESSION_SECRET,
  );

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthSession(): Promise<SessionPayload | null> {
  const env = await getAuthEnv();

  if (!env.AUTH_SESSION_SECRET) {
    throw new AuthConfigError();
  }

  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token, env.AUTH_SESSION_SECRET);
}

export async function requireAuthSession(): Promise<SessionPayload> {
  const session = await getAuthSession();

  if (!session) {
    throw new AuthSessionError();
  }

  return session;
}

export { SESSION_COOKIE_NAME, AuthConfigError, AuthSessionError };
