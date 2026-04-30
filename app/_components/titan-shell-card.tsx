interface TitanShellCardProps {
  kicker: string;
  title: string;
  description: string;
  badge?: string;
  tone?: "default" | "alert";
  children?: React.ReactNode;
}

const toneClasses: Record<NonNullable<TitanShellCardProps["tone"]>, string> = {
  default: "via-[#ee4266]",
  alert: "via-[#ff8a66]",
};

export function TitanShellCard({
  kicker,
  title,
  description,
  badge,
  tone = "default",
  children,
}: TitanShellCardProps): React.JSX.Element {
  return (
    <section className="panel rounded-[36px] px-5 py-6 sm:px-6">
      <div
        className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent ${toneClasses[tone]} to-transparent`}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h1 className="score-text mt-3 text-[clamp(2rem,8vw,3.8rem)] leading-none text-[#fff7de]">
            {title}
          </h1>
        </div>
        {badge ? (
          <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#fff7de]">
            {badge}
          </span>
        ) : null}
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--titan-muted)]">
        {description}
      </p>

      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
