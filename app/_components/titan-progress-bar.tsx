"use client";

import { motion } from "framer-motion";

interface TitanProgressBarProps {
  current: number;
  goal: number;
}

export function TitanProgressBar({
  current,
  goal,
}: TitanProgressBarProps): React.JSX.Element {
  const clamped = Math.min(current / goal, 1);
  const percentage = Math.round(clamped * 100);

  return (
    <div className="panel rounded-[28px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Protein XP</p>
          <h3 className="mt-2 text-xl font-semibold text-[#fff7de]">
            Protein Log reactor
          </h3>
        </div>
        <span className="action-chip rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
          {percentage}% online
        </span>
      </div>

      <div className="relative h-5 overflow-hidden rounded-full border border-white/10 bg-black/35">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(221,216,184,0.08),transparent)]" />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#1b4965_0%,#4f89af_48%,#ee4266_100%)] shadow-[0_0_32px_rgba(238,66,102,0.38)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="score-text text-3xl text-[#fff7de]">{current}g</p>
          <p className="text-sm text-[var(--titan-muted)]">
            Structural Bricks loaded today
          </p>
        </div>
        <p className="text-right text-sm font-semibold uppercase tracking-[0.2em] text-[#fff7de]">
          Goal {goal}g
        </p>
      </div>
    </div>
  );
}
