"use server";

import { redirect } from "next/navigation";

import {
  clearSessionCookie,
  createSessionCookie,
  verifyPassword,
} from "@/lib/server/auth";

const PASSWORD_FIELD = "password";
const REDIRECT_FIELD = "redirect";
const MAX_PASSWORD_LENGTH = 256;
const SAFE_REDIRECT_PATTERN = /^\/(?!\/)[^\s]*$/;

function readSafeRedirect(formData: FormData): string {
  const value = formData.get(REDIRECT_FIELD);
  if (typeof value !== "string") {
    return "/";
  }
  if (value.length > 256 || !SAFE_REDIRECT_PATTERN.test(value)) {
    return "/";
  }
  return value;
}

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get(PASSWORD_FIELD);
  const target = readSafeRedirect(formData);

  if (typeof password !== "string" || password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
    redirect(`/login?error=invalid&redirect=${encodeURIComponent(target)}`);
  }

  let ok = false;
  try {
    ok = await verifyPassword(password as string);
  } catch (error) {
    console.error("[titan-auth:login]", error);
    redirect(`/login?error=config&redirect=${encodeURIComponent(target)}`);
  }

  if (!ok) {
    redirect(`/login?error=invalid&redirect=${encodeURIComponent(target)}`);
  }

  try {
    await createSessionCookie();
  } catch (error) {
    console.error("[titan-auth:login]", error);
    redirect(`/login?error=config&redirect=${encodeURIComponent(target)}`);
  }

  redirect(target);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
