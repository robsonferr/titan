import { redirect, notFound } from "next/navigation";

import { TitanShellCard } from "@/app/_components/titan-shell-card";
import { TitanSubmitButton } from "@/app/_components/titan-submit-button";
import {
  buildLocalizedPath,
  getMessages,
  isSupportedLocale,
  type Locale,
} from "@/lib/i18n";
import { getAuthSession } from "@/lib/server/auth";

import { loginAction } from "../../login/actions";

export const dynamic = "force-dynamic";

const SAFE_REDIRECT_PATTERN = /^\/(?!\/)[^\s]*$/;

function readSafeRedirect(value: string | string[] | undefined, locale: Locale): string {
  if (typeof value !== "string") {
    return buildLocalizedPath(locale);
  }
  if (value.length > 256 || !SAFE_REDIRECT_PATTERN.test(value)) {
    return buildLocalizedPath(locale);
  }
  return value;
}

function readErrorMessage(
  value: string | string[] | undefined,
  locale: Locale,
): string | null {
  const messages = getMessages(locale);

  if (value === "invalid") {
    return messages.login.errorInvalid;
  }
  if (value === "config") {
    return messages.login.errorConfig;
  }
  if (value === "throttled") {
    return messages.login.errorThrottled;
  }
  return null;
}

export default async function LocalizedLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const [{ locale }, paramsData] = await Promise.all([params, searchParams]);

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);
  const target = readSafeRedirect(paramsData.redirect, locale);
  const errorMessage = readErrorMessage(paramsData.error, locale);

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
        kicker={messages.login.kicker}
        title={messages.login.title}
        description={messages.login.description}
      >
        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="redirect" value={target} />
          <input
            type="text"
            name="username"
            autoComplete="username"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--titan-muted)]"
            >
              {messages.login.passwordLabel}
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
            idleLabel={messages.login.idleLabel}
            pendingLabel={messages.login.pendingLabel}
            className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
          />
        </form>
      </TitanShellCard>
    </main>
  );
}
