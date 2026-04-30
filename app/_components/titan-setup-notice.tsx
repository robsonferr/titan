import { TitanShellCard } from "@/app/_components/titan-shell-card";

interface TitanSetupNoticeProps {
  bindingName: string;
  commands: Array<{
    label: string;
    command: string;
  }>;
}

export function TitanSetupNotice({
  bindingName,
  commands,
}: TitanSetupNoticeProps): React.JSX.Element {
  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
      <TitanShellCard
        kicker="Phase 2 // Data layer"
        title="TITAN DB offline"
        description="The D1 binding is reachable, but the TITAN schema has not been applied yet. Run the migration and seed flow below, then reload the app."
        badge="Setup needed"
      >
        <div className="grid gap-4">
          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
              D1 binding
            </p>
            <p className="mt-2 break-all text-sm text-[#fff7de]">{bindingName}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {commands.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-white/10 bg-black/25 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
                  {item.label}
                </p>
                <p className="mt-2 break-all font-mono text-sm text-[#fff7de]">
                  {item.command}
                </p>
              </div>
            ))}
          </div>
        </div>
      </TitanShellCard>
    </main>
  );
}
