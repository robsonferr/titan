import { TitanShellCard } from "@/app/_components/titan-shell-card";

export default function Loading(): React.JSX.Element {
  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-6xl">
      <TitanShellCard
        kicker="Phase 5 // Loading"
        title="Booting TITAN"
        description="Syncing the active template, Boss state, and forge deck."
        badge="Loading"
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel rounded-[28px] p-5">
            <div className="h-3 w-28 rounded-full bg-white/10" />
            <div className="mt-4 h-10 w-40 rounded-full bg-white/12" />
            <div className="mt-4 h-4 w-full rounded-full bg-white/8" />
            <div className="mt-2 h-4 w-4/5 rounded-full bg-white/8" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="h-20 rounded-[22px] bg-black/20" />
              <div className="h-20 rounded-[22px] bg-black/20" />
              <div className="h-20 rounded-[22px] bg-black/20" />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="panel h-40 rounded-[28px] bg-black/20" />
            <div className="panel h-32 rounded-[28px] bg-black/20" />
          </div>
        </div>
      </TitanShellCard>
    </main>
  );
}
