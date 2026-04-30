import { logoutAction } from "@/app/login/actions";

export function TitanLogoutButton(): React.JSX.Element {
  return (
    <form action={logoutAction} className="fixed right-4 top-4 z-30">
      <button
        type="submit"
        className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--titan-muted)] backdrop-blur transition hover:text-[#fff7de]"
      >
        Sign out
      </button>
    </form>
  );
}
