"use client";

import { motion, type Variants } from "framer-motion";

import { MonthlyBossWidget } from "@/app/_components/monthly-boss-widget";
import { TitanProgressBar } from "@/app/_components/titan-progress-bar";
import type { DashboardSnapshot, Quest, Reward } from "@/lib/titan";

const easeOut = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: easeOut,
    },
  },
};

const rarityStyles: Record<Reward["rarity"], string> = {
  common: "border-white/12 bg-white/6 text-[var(--titan-text)]",
  rare: "border-sky-300/20 bg-sky-300/10 text-sky-100",
  legendary: "border-pink-300/20 bg-pink-300/10 text-pink-100",
};

const questTone: Record<Quest["type"], string> = {
  daily: "from-[#1b4965] to-[#102b3b]",
  weekly: "from-[#315f84] to-[#1b4965]",
  monthly: "from-[#ee4266] to-[#8d1f39]",
  epic: "from-[#ee4266] via-[#823e8c] to-[#1b4965]",
};

const navItems = [
  { label: "HUD", active: true },
  { label: "Quests", active: false },
  { label: "Boss", active: false },
  { label: "Forge", active: false },
] as const;

interface TitanDashboardProps {
  snapshot: DashboardSnapshot;
  children?: React.ReactNode;
}

function QuestCard({ quest }: { quest: Quest }): React.JSX.Element {
  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -2, scale: 1.01 }}
      className="panel rounded-[28px] p-4"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">{quest.cadenceLabel}</p>
          <h3 className="mt-2 text-lg font-semibold text-[#fff7de]">
            {quest.title}
          </h3>
        </div>
        <span
          className={`rounded-full bg-gradient-to-r ${questTone[quest.type]} px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.24)]`}
        >
          {quest.type}
        </span>
      </div>

      <p className="text-sm leading-6 text-[var(--titan-muted)]">
        {quest.summary}
      </p>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#fff7de]">
            {quest.progressLabel}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
            {quest.rewardLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="score-text text-2xl text-[#fff7de]">+{quest.xpValue}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
            XP
          </p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        className={`neo-button mt-5 flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#fff7de] ${
          quest.completed ? "opacity-70" : ""
        }`}
        type="button"
      >
        {quest.completed ? "Quest cleared" : "Open quest"}
      </motion.button>
    </motion.article>
  );
}

function RewardCard({ reward }: { reward: Reward }): React.JSX.Element {
  return (
    <motion.article
      variants={itemVariants}
      className="panel rounded-[24px] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Shop reward</p>
          <h3 className="mt-2 text-base font-semibold text-[#fff7de]">
            {reward.title}
          </h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${rarityStyles[reward.rarity]}`}
        >
          {reward.rarity}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--titan-muted)]">
        {reward.description}
      </p>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="score-text text-2xl text-[#fff7de]">{reward.xpCost}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
            XP cost
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            reward.unlocked
              ? "border border-emerald-300/20 bg-emerald-300/10 text-[#b4ffd8]"
              : "border border-white/10 bg-white/6 text-[var(--titan-muted)]"
          }`}
        >
          {reward.unlocked ? "Unlocked" : "Locked"}
        </span>
      </div>
    </motion.article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption: string;
}): React.JSX.Element {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <p className="section-kicker">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#fff7de]">{title}</h2>
      </div>
      <p className="max-w-[12rem] text-right text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
        {caption}
      </p>
    </div>
  );
}

export function TitanDashboard({
  snapshot,
  children,
}: TitanDashboardProps): React.JSX.Element {
  const bossPercent = Math.round(snapshot.monthlyBoss.engagementScore * 100);
  const coreProgressLabel = `${snapshot.dailyLog.completedCoreQuests}/${snapshot.dailyLog.totalCoreQuests}`;

  return (
    <main className="safe-bottom relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6 sm:max-w-2xl sm:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col gap-4"
      >
        <motion.section
          variants={itemVariants}
          className="panel rounded-[36px] px-5 py-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-kicker">Phase 3 // Management forge</p>
              <h1 className="score-text mt-3 text-[clamp(2.4rem,8vw,4rem)] leading-none text-[#fff7de]">
                TITAN
              </h1>
              <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[var(--titan-muted)]">
                {snapshot.activeTemplate.summary}
              </p>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--titan-muted)]">
                Pilot
              </p>
              <p className="mt-2 text-lg font-semibold text-[#fff7de]">
                {snapshot.playerName}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                {snapshot.todayLabel}
              </p>
            </div>
          </div>

          <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fff7de]">
            Active template // {snapshot.activeTemplate.title}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-[22px] border border-white/10 bg-black/18 p-3">
              <p className="section-kicker">Streak</p>
              <p className="score-text mt-2 text-3xl text-[#fff7de]">
                {snapshot.streakDays}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/18 p-3">
              <p className="section-kicker">Core</p>
              <p className="score-text mt-2 text-3xl text-[#fff7de]">
                {coreProgressLabel}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/18 p-3">
              <p className="section-kicker">Boss</p>
              <p className="score-text mt-2 text-3xl text-[#fff7de]">
                {bossPercent}
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants}>
          <MonthlyBossWidget {...snapshot.monthlyBoss} />
        </motion.section>

        {snapshot.featuredGoal ? (
          <motion.section variants={itemVariants}>
            <TitanProgressBar
              kicker="Featured Goal"
              title={snapshot.featuredGoal.title}
              caption={snapshot.featuredGoal.summary}
              current={snapshot.featuredGoal.current}
              goal={snapshot.featuredGoal.goal}
              unit={snapshot.featuredGoal.unit}
            />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {snapshot.featuredGoal.options.map((option) => (
                <div
                  key={option.id}
                  className="panel rounded-[22px] p-3 text-center"
                >
                  <p className="section-kicker">{option.label}</p>
                  <p className="score-text mt-2 text-2xl text-[#fff7de]">
                    +{option.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    x{option.usesToday} today
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        ) : null}

        <motion.section variants={itemVariants}>
          <SectionHeader
            eyebrow="Today run"
            title="Daily Quests"
            caption={snapshot.activeTemplate.successRuleLabel}
          />
          <div className="grid gap-4">
            {snapshot.dailyQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants}>
          <SectionHeader
            eyebrow="Secondary lanes"
            title="Weekly + Monthly + Epic"
            caption="The template still drives the medium and long arcs."
          />
          <div className="grid gap-4">
            {[
              ...snapshot.weeklyQuests,
              ...snapshot.monthlyQuests,
              ...snapshot.epicQuests,
            ].map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants}>
          <SectionHeader
            eyebrow="Loot room"
            title="Shop preview"
            caption="Rewards can stay standalone or attach to quests."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {snapshot.rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </motion.section>

        {children ? <motion.section variants={itemVariants}>{children}</motion.section> : null}

        <motion.nav
          variants={itemVariants}
          className="panel sticky bottom-3 z-10 mt-2 grid grid-cols-4 rounded-full px-3 py-3"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${
                item.active
                  ? "bg-[var(--titan-action)] text-white shadow-[0_12px_24px_rgba(238,66,102,0.26)]"
                  : "text-[var(--titan-muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </motion.nav>
      </motion.div>
    </main>
  );
}
