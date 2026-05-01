import { logoutAction } from "@/app/login/actions";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth";
import { getMessages, type Locale } from "@/lib/i18n";

export function TitanLogoutButton({
  locale,
}: {
  locale: Locale;
}): React.JSX.Element | null {
  if (isDevAuthBypassEnabled()) {
    return null;
  }

  const messages = getMessages(locale);

  return (
    <form action={logoutAction} className="fixed right-4 top-4 z-30">
      <button
        type="submit"
        className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--titan-muted)] transition hover:text-[#fff7de]"
      >
        {messages.logout.button}
      </button>
    </form>
  );
}
