"use client";

import { usePathname } from "next/navigation";

import { TitanShellCard } from "@/app/_components/titan-shell-card";
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  getMessages,
} from "@/lib/i18n";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
          <TitanShellCard
            kicker={messages.globalError.kicker}
            title={messages.globalError.title}
            description={messages.globalError.description}
            badge={messages.globalError.badge}
            tone="alert"
          >
            <button
              type="button"
              onClick={() => reset()}
              className="neo-button rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
            >
              {messages.globalError.retry}
            </button>
          </TitanShellCard>
        </main>
      </body>
    </html>
  );
}
