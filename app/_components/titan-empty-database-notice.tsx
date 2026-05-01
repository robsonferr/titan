import { TitanManagementConsole } from "@/app/_components/titan-management-console";
import { TitanShellCard } from "@/app/_components/titan-shell-card";
import { getMessages, type Locale } from "@/lib/i18n";
import type { ManagementSnapshot } from "@/lib/titan";

interface TitanEmptyDatabaseNoticeProps {
  locale: Locale;
  bindingName: string;
  management: ManagementSnapshot;
}

export function TitanEmptyDatabaseNotice({
  locale,
  bindingName,
  management,
}: TitanEmptyDatabaseNoticeProps): React.JSX.Element {
  const messages = getMessages(locale);

  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-6xl">
      <TitanShellCard
        kicker={messages.emptyDatabaseNotice.kicker}
        title={messages.emptyDatabaseNotice.title}
        description={messages.emptyDatabaseNotice.description}
        badge={messages.emptyDatabaseNotice.badge}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
              {messages.emptyDatabaseNotice.statusLabel}
            </p>
            <p className="mt-2 text-sm text-[#fff7de]">
              {messages.emptyDatabaseNotice.statusDescription}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--titan-muted)]">
              {messages.emptyDatabaseNotice.activeBinding}
            </p>
            <p className="mt-2 break-all text-sm text-[#fff7de]">{bindingName}</p>
          </div>
        </div>
      </TitanShellCard>

      <TitanManagementConsole locale={locale} management={management} />
    </main>
  );
}
