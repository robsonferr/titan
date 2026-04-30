import { redirect } from "next/navigation";

import { TitanShellCard } from "@/app/_components/titan-shell-card";
import { TitanSubmitButton } from "@/app/_components/titan-submit-button";
import { getAuthSession } from "@/lib/server/auth";

import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

const SAFE_REDIRECT_PATTERN = /^\/(?!\/)[^\s]*$/;

function readSafeRedirect(value: string | string[] | undefined): string {
  if (typeof value !== "string") {
    return "/";
  }
  if (value.length > 256 || !SAFE_REDIRECT_PATTERN.test(value)) {
    return "/";
  }
  return value;
}

function readErrorMessage(value: string | string[] | undefined): string | null {
  if (value === "invalid") {
    return "Senha incorreta. Tente novamente.";
  }
  if (value === "config") {
    return "Auth não configurada neste runtime.";
  }
  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const target = readSafeRedirect(params.redirect);
  const errorMessage = readErrorMessage(params.error);

  let session = null;
  try {
    session = await getAuthSession();
  } catch {
    session = null;
  }

  if (session) {
    redirect(target);
  }

  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6">
      <TitanShellCard
        kicker="Phase 0 // Access gate"
        title="Sign in to TITAN"
        description="The dashboard is private. Enter the run password to unlock the deck."
      >
        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="redirect" value={target} />

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--titan-muted)]"
            >
              Run password
            </label>
            <input
              id="login-password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
              maxLength={256}
              className="titan-input"
              type="password"
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-[#ff8a66]" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <TitanSubmitButton
            idleLabel="Unlock deck"
            pendingLabel="Verifying..."
            className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
          />
        </form>
      </TitanShellCard>
    </main>
  );
}
