import { TitanShellCard } from "@/app/_components/titan-shell-card";

interface TitanDeploymentNoticeProps {
  title: string;
  description: string;
  envKey: string;
  exampleValue: string;
}

export function TitanDeploymentNotice({
  title,
  description,
  envKey,
  exampleValue,
}: TitanDeploymentNoticeProps): React.JSX.Element {
  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
      <TitanShellCard
        kicker="Phase 6 // Deployment readiness"
        title={title}
        description={description}
        badge="Env required"
        tone="alert"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
              Required variable
            </p>
            <p className="mt-2 font-mono text-sm text-[#fff7de]">{envKey}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
              Example value
            </p>
            <p className="mt-2 break-all font-mono text-sm text-[#fff7de]">
              {exampleValue}
            </p>
          </div>
        </div>
      </TitanShellCard>
    </main>
  );
}
