interface TitanEmptyPanelProps {
  kicker: string;
  title: string;
  description: string;
  hint?: string;
  className?: string;
}

export function TitanEmptyPanel({
  kicker,
  title,
  description,
  hint,
  className = "",
}: TitanEmptyPanelProps): React.JSX.Element {
  return (
    <div
      className={`rounded-[24px] border border-dashed border-white/14 bg-black/18 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${className}`.trim()}
    >
      <p className="section-kicker">{kicker}</p>
      <h3 className="mt-2 text-lg font-semibold text-[#fff7de]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--titan-muted)]">{description}</p>
      {hint ? (
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff7de]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
