"use client";

import { useEffect } from "react";
import Link from "next/link";

import { TitanShellCard } from "@/app/_components/titan-shell-card";

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

  const message =
    "A route-level fault interrupted the run. The shell stayed visible so the failure is not silent.";

  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
      <TitanShellCard
        kicker="Phase 5 // Error state"
        title="Run interrupted"
        description={message}
        badge="Failure visible"
        tone="alert"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="neo-button rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
          >
            Retry route
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[var(--titan-text)]"
          >
            Back to dashboard
          </Link>
        </div>
      </TitanShellCard>
    </main>
  );
}
