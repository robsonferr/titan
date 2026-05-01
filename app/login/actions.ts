"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { buildLocalizedPath, getLocaleFromAbsoluteUrl } from "@/lib/i18n";
import {
  clearSessionCookie,
  createSessionCookie,
  verifyPassword,
} from "@/lib/server/auth";
import {
  checkLoginRateLimit,
  registerLoginFailure,
  registerLoginSuccess,
} from "@/lib/server/login-rate-limit";

const PASSWORD_FIELD = "password";
const REDIRECT_FIELD = "redirect";
const MAX_PASSWORD_LENGTH = 256;
const SAFE_REDIRECT_PATTERN = /^\/(?!\/)[^\s]*$/;

function readSafeRedirect(formData: FormData): string {
  const value = formData.get(REDIRECT_FIELD);
  if (typeof value !== "string") {
    return buildLocalizedPath(getLocaleFromAbsoluteUrl(null));
  }
  if (value.length > 256 || !SAFE_REDIRECT_PATTERN.test(value)) {
    return buildLocalizedPath(getLocaleFromAbsoluteUrl(null));
  }
  return value;
}

async function readClientIp(): Promise<string> {
  const headerStore = await headers();
  const cfConnecting = headerStore.get("cf-connecting-ip");
  if (cfConnecting) {
    return cfConnecting;
  }
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return "unknown";
}

function buildLoginRedirect(
  locale: ReturnType<typeof getLocaleFromAbsoluteUrl>,
  target: string,
  error: "invalid" | "config" | "throttled",
): string {
  return `${buildLocalizedPath(locale, "/login")}?error=${error}&redirect=${encodeURIComponent(target)}`;
}

export async function loginAction(formData: FormData): Promise<void> {
  const locale = getLocaleFromAbsoluteUrl((await headers()).get("referer"));
  const password = formData.get(PASSWORD_FIELD);
  const target = readSafeRedirect(formData);

  if (
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    redirect(buildLoginRedirect(locale, target, "invalid"));
  }

  const ip = await readClientIp();

  let limit;
  try {
    limit = await checkLoginRateLimit(ip);
  } catch (error) {
    console.error("[titan-auth:login]", error);
    redirect(buildLoginRedirect(locale, target, "config"));
  }

  if (!limit.allowed) {
    redirect(buildLoginRedirect(locale, target, "throttled"));
  }

  let ok = false;
  try {
    ok = await verifyPassword(password as string);
  } catch (error) {
    console.error("[titan-auth:login]", error);
    redirect(buildLoginRedirect(locale, target, "config"));
  }

  if (!ok) {
    try {
      await registerLoginFailure(ip);
    } catch (error) {
      console.error("[titan-auth:login]", error);
    }
    redirect(buildLoginRedirect(locale, target, "invalid"));
  }

  try {
    await registerLoginSuccess(ip);
    await createSessionCookie();
  } catch (error) {
    console.error("[titan-auth:login]", error);
    redirect(buildLoginRedirect(locale, target, "config"));
  }

  redirect(target);
}

export async function logoutAction(): Promise<void> {
  const locale = getLocaleFromAbsoluteUrl((await headers()).get("referer"));
  await clearSessionCookie();
  redirect(buildLocalizedPath(locale, "/login"));
}
