import Link from "next/link";

import { TitanShellCard } from "@/app/_components/titan-shell-card";

export default function NotFound(): React.JSX.Element {
  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
      <TitanShellCard
        kicker="Phase 5 // Not found"
        title="Sector not found"
        description="That route is outside the TITAN map. Jump back to the main dashboard to continue the run."
        badge="404"
      >
        <Link
          href="/"
          className="neo-button inline-flex rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
        >
          Return to TITAN
        </Link>
      </TitanShellCard>
    </main>
  );
}
