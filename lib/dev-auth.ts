import type { SessionPayload } from "@/lib/auth-token";

export const DEV_AUTH_BYPASS_ENV = "TITAN_DEV_AUTH_BYPASS";

export function isDevAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env[DEV_AUTH_BYPASS_ENV] === "1"
  );
}

export function getDevAuthSession(): SessionPayload {
  return {
    sub: "dev-bypass",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  };
}
