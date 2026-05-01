import { headers } from "next/headers";
import Link from "next/link";

import { TitanShellCard } from "@/app/_components/titan-shell-card";
import {
  buildLocalizedPath,
  getMessages,
  LOCALE_HEADER,
  resolveLocale,
} from "@/lib/i18n";

export default async function NotFound(): Promise<React.JSX.Element> {
  const locale = resolveLocale((await headers()).get(LOCALE_HEADER));
  const messages = getMessages(locale);

  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
      <TitanShellCard
        kicker={messages.notFound.kicker}
        title={messages.notFound.title}
        description={messages.notFound.description}
        badge="404"
      >
        <Link
          href={buildLocalizedPath(locale)}
          className="neo-button inline-flex rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
        >
          {messages.notFound.button}
        </Link>
      </TitanShellCard>
    </main>
  );
}
