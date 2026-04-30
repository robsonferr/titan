import { TitanManagementConsole } from "@/app/_components/titan-management-console";
import { TitanShellCard } from "@/app/_components/titan-shell-card";
import type { ManagementSnapshot } from "@/lib/titan";

interface TitanEmptyDatabaseNoticeProps {
  dbPath: string;
  management: ManagementSnapshot;
}

export function TitanEmptyDatabaseNotice({
  dbPath,
  management,
}: TitanEmptyDatabaseNoticeProps): React.JSX.Element {
  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-6xl">
      <TitanShellCard
        kicker="Phase 5 // Empty database"
        title="Forge the first template"
        description="The TITAN database is online, but it does not contain any templates yet. Build the first run below so the dashboard, Boss, and Shop can boot with real data."
        badge="Deck offline"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
              Status
            </p>
            <p className="mt-2 text-sm text-[#fff7de]">
              Database initialized. Create a Template first, then add Quests and Rewards.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
              Active DB path
            </p>
            <p className="mt-2 break-all text-sm text-[#fff7de]">{dbPath}</p>
          </div>
        </div>
      </TitanShellCard>

      <TitanManagementConsole management={management} />
    </main>
  );
}
