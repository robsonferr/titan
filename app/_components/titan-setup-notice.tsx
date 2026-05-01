import { TitanShellCard } from "@/app/_components/titan-shell-card";
import { getMessages, type Locale } from "@/lib/i18n";

interface TitanSetupNoticeProps {
  locale: Locale;
  bindingName: string;
  commands: Array<{
    label: string;
    command: string;
  }>;
}

export function TitanSetupNotice({
  locale,
  bindingName,
  commands,
}: TitanSetupNoticeProps): React.JSX.Element {
  const messages = getMessages(locale);

  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
      <TitanShellCard
        kicker={messages.setupNotice.kicker}
        title={messages.setupNotice.title}
        description={messages.setupNotice.description}
        badge={messages.setupNotice.badge}
      >
        <div className="grid gap-4">
          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
              {messages.setupNotice.binding}
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
