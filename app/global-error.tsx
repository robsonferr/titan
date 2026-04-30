"use client";

import { TitanShellCard } from "@/app/_components/titan-shell-card";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
          <TitanShellCard
            kicker="Phase 5 // Global error"
            title="Shell crashed"
            description="A root-level failure took down the TITAN shell. Reload the route or retry the root render."
            badge="Root fault"
            tone="alert"
          >
            <button
              type="button"
              onClick={() => reset()}
              className="neo-button rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
            >
              Retry shell
            </button>
          </TitanShellCard>
        </main>
      </body>
    </html>
  );
}
