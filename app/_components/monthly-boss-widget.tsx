"use client";

import { motion } from "framer-motion";

import { getMessages, type Locale } from "@/lib/i18n";

interface MonthlyBossWidgetProps {
  locale: Locale;
  month: string;
  engagementScore: number;
  threshold: number;
  completedDays: number;
  totalDays: number;
  successRuleLabel: string;
}

export function MonthlyBossWidget({
  locale,
  month,
  engagementScore,
  threshold,
  completedDays,
  totalDays,
  successRuleLabel,
}: MonthlyBossWidgetProps): React.JSX.Element {
  const messages = getMessages(locale);
  const percentage = Math.round(engagementScore * 100);
  const thresholdPercent = Math.round(threshold * 100);
  const hasTrackedDays = totalDays > 0;
  const bossStatusLabel = !hasTrackedDays
    ? messages.monthlyBoss.monthBooting
    : percentage >= thresholdPercent
      ? messages.monthlyBoss.shieldUp
      : messages.monthlyBoss.recovering;
  const ringStyle = {
    background: `conic-gradient(#ee4266 ${percentage}%, rgba(255,255,255,0.08) ${percentage}% 100%)`,
  };

  return (
    <div className="panel rounded-[32px] p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="section-kicker">{messages.monthlyBoss.kicker}</p>
          <h3 className="mt-2 text-xl font-semibold text-[#fff7de]">
            {messages.monthlyBoss.title}
          </h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--titan-muted)]">
          {month}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          className="relative grid h-28 w-28 place-items-center rounded-full p-2"
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={ringStyle}
        >
          <div className="grid h-full w-full place-items-center rounded-full border border-white/10 bg-[rgba(18,8,10,0.95)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <span className="score-text text-3xl text-[#fff7de]">
              {percentage}
            </span>
            <span className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--titan-muted)]">
              {messages.monthlyBoss.percent}
            </span>
          </div>
        </motion.div>

        <div className="space-y-3 text-sm text-[var(--titan-muted)]">
          {hasTrackedDays ? (
            <p>
              <span className="font-semibold text-[#fff7de]">{completedDays}</span>{" "}
              {messages.monthlyBoss.successfulDaysPrefix}{" "}
              <span className="font-semibold text-[#fff7de]">{totalDays}</span>.
            </p>
          ) : (
            <p>{messages.monthlyBoss.noClearedDays}</p>
          )}
          <p>{successRuleLabel}</p>
          <p>
            {messages.monthlyBoss.thresholdPrefix}{" "}
            <span className="font-semibold text-[#fff7de]">{thresholdPercent}%</span>{" "}
            {messages.monthlyBoss.thresholdSuffix}
          </p>
          <div
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
              hasTrackedDays
                ? percentage >= thresholdPercent
                  ? "border border-emerald-300/20 bg-emerald-300/10 text-[#b4ffd8]"
                  : "border border-amber-300/20 bg-amber-300/10 text-[#ffd8a8]"
                : "border border-white/10 bg-white/6 text-[var(--titan-muted)]"
            }`}
          >
            {bossStatusLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
