"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { TitanShellCard } from "@/app/_components/titan-shell-card";
import {
  DEFAULT_LOCALE,
  buildLocalizedPath,
  getLocaleFromPathname,
  getMessages,
} from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error("[titan-route-error]", error.digest ?? "no-digest");
  }, [error]);

  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const messages = getMessages(locale);

  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
      <TitanShellCard
        kicker={messages.error.kicker}
        title={messages.error.title}
        description={messages.error.description}
        badge={messages.error.badge}
        tone="alert"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="neo-button rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
          >
            {messages.error.retry}
          </button>
          <Link
            href={buildLocalizedPath(locale)}
            className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[var(--titan-text)]"
          >
            {messages.error.back}
          </Link>
        </div>
      </TitanShellCard>
    </main>
  );
}
