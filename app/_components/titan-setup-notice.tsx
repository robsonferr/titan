interface TitanSetupNoticeProps {
  dbPath: string;
}

export function TitanSetupNotice({
  dbPath,
}: TitanSetupNoticeProps): React.JSX.Element {
  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6">
      <section className="panel rounded-[36px] px-5 py-6">
        <p className="section-kicker">Phase 2 // Data layer</p>
        <h1 className="score-text mt-3 text-[clamp(2rem,8vw,3.6rem)] leading-none text-[#fff7de]">
          TITAN DB offline
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--titan-muted)]">
          The UI is ready, but the local database file has not been initialized
          yet. Run the bootstrap command below, then reload the app.
        </p>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
            Command
          </p>
          <p className="mt-2 font-mono text-sm text-[#fff7de]">
            npm run db:init
          </p>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
            Expected DB path
          </p>
          <p className="mt-2 break-all text-sm text-[#fff7de]">{dbPath}</p>
        </div>
      </section>
    </main>
  );
}
