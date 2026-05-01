"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";

import { logoutAction } from "@/app/login/actions";
import { TitanEmptyPanel } from "@/app/_components/titan-empty-panel";
import { MonthlyBossWidget } from "@/app/_components/monthly-boss-widget";
import { TitanProgressBar } from "@/app/_components/titan-progress-bar";
import { TitanSubmitButton } from "@/app/_components/titan-submit-button";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth";
import {
  buildLocalizedPath,
  formatQuestTypeLabel,
  formatRewardRarityLabel,
  getMessages,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n";
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

interface TitanDashboardProps {
  locale: Locale;
  snapshot: DashboardSnapshot;
  onToggleDailyQuest: (formData: FormData) => Promise<void>;
  onApplyQuestProgressOption: (formData: FormData) => Promise<void>;
  sections?: Partial<{
    hero: boolean;
    monthlyBoss: boolean;
    featuredGoal: boolean;
    dailyQuests: boolean;
    secondaryQuests: boolean;
    rewards: boolean;
  }>;
  children?: React.ReactNode;
}

function QuestCard({
  quest,
  locale,
  onToggleDailyQuest,
  featuredQuestId,
}: {
  quest: Quest;
  locale: Locale;
  onToggleDailyQuest?: (formData: FormData) => Promise<void>;
  featuredQuestId?: string | null;
}): React.JSX.Element {
  const messages = getMessages(locale);
  const isBooleanDailyQuest =
    quest.type === "daily" && quest.progressKind === "boolean";
  const isCounterDailyQuest =
    quest.type === "daily" && quest.progressKind === "counter";

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
          {formatQuestTypeLabel(locale, quest.type)}
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
            {messages.dashboard.questCard.xp}
          </p>
        </div>
      </div>

      {isBooleanDailyQuest && onToggleDailyQuest ? (
        <form action={onToggleDailyQuest} className="mt-5">
          <input type="hidden" name="quest_id" value={quest.id} />
          <TitanSubmitButton
            idleLabel={
              quest.completed
                ? messages.dashboard.questCard.undoCheck
                : messages.dashboard.questCard.markDone
            }
            pendingLabel={messages.dashboard.questCard.syncingQuest}
            className={`neo-button flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#fff7de] ${
              quest.completed ? "opacity-70" : ""
            }`}
          />
        </form>
      ) : isCounterDailyQuest ? (
        <div className="mt-5 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[var(--titan-muted)]">
          {featuredQuestId === quest.id
            ? messages.dashboard.questCard.useQuickAddDeckAbove
            : messages.dashboard.questCard.addQuickOptionsInForge}
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.98 }}
          className={`neo-button mt-5 flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#fff7de] ${
            quest.completed ? "opacity-70" : ""
          }`}
          type="button"
        >
          {quest.completed
            ? messages.dashboard.questCard.questCleared
            : messages.dashboard.questCard.openQuest}
        </motion.button>
      )}
    </motion.article>
  );
}

function RewardCard({
  reward,
  locale,
}: {
  reward: Reward;
  locale: Locale;
}): React.JSX.Element {
  const messages = getMessages(locale);

  return (
    <motion.article
      variants={itemVariants}
      className="panel rounded-[24px] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">{messages.dashboard.rewardCard.kicker}</p>
          <h3 className="mt-2 text-base font-semibold text-[#fff7de]">
            {reward.title}
          </h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${rarityStyles[reward.rarity]}`}
        >
          {formatRewardRarityLabel(locale, reward.rarity)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--titan-muted)]">
        {reward.description}
      </p>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="score-text text-2xl text-[#fff7de]">{reward.xpCost}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
            {messages.dashboard.rewardCard.xpCost}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            reward.unlocked
              ? "border border-emerald-300/20 bg-emerald-300/10 text-[#b4ffd8]"
              : "border border-white/10 bg-white/6 text-[var(--titan-muted)]"
          }`}
        >
          {reward.unlocked ? messages.enums.unlocked : messages.enums.locked}
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

function DashboardHeaderControls({
  locale,
}: {
  locale: Locale;
}): React.JSX.Element {
  const pathname = usePathname();
  const messages = getMessages(locale);
  const currentPath = pathname || buildLocalizedPath(locale);

  return (
    <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
      <div>
        <p className="section-kicker">{messages.dashboard.hero.controlsLabel}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--titan-muted)]">
          {messages.dashboard.hero.languageLabel}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
          {SUPPORTED_LOCALES.map((targetLocale) => {
            const isActive = targetLocale === locale;
            const label = targetLocale === "pt-BR" ? "PT" : "EN";

            return (
              <Link
                key={targetLocale}
                href={buildLocalizedPath(targetLocale, currentPath)}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                  isActive
                    ? "bg-[var(--titan-action)] text-white shadow-[0_10px_20px_rgba(238,66,102,0.22)]"
                    : "text-[var(--titan-muted)] hover:text-[#fff7de]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {!isDevAuthBypassEnabled() ? (
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--titan-muted)] transition hover:border-white/20 hover:text-[#fff7de]"
            >
              {messages.logout.button}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export function TitanDashboard({
  locale,
  snapshot,
  onToggleDailyQuest,
  onApplyQuestProgressOption,
  sections,
  children,
}: TitanDashboardProps): React.JSX.Element {
  const pathname = usePathname();
  const messages = getMessages(locale);
  const visibleSections = {
    hero: true,
    monthlyBoss: true,
    featuredGoal: true,
    dailyQuests: true,
    secondaryQuests: true,
    rewards: true,
    ...sections,
  } as const;
  const navItems = [
    {
      label: messages.dashboard.nav.hud,
      href: buildLocalizedPath(locale),
    },
    {
      label: messages.dashboard.nav.quests,
      href: buildLocalizedPath(locale, "/quests"),
    },
    {
      label: messages.dashboard.nav.boss,
      href: buildLocalizedPath(locale, "/boss"),
    },
    {
      label: messages.dashboard.nav.forge,
      href: buildLocalizedPath(locale, "/forge"),
    },
  ] as const;
  const bossPercent = Math.round(snapshot.monthlyBoss.engagementScore * 100);
  const coreProgressLabel = `${snapshot.dailyLog.completedCoreQuests}/${snapshot.dailyLog.totalCoreQuests}`;
  const featuredQuestId = snapshot.featuredGoal?.questId ?? null;
  const hasSecondaryQuests =
    snapshot.weeklyQuests.length > 0 ||
    snapshot.monthlyQuests.length > 0 ||
    snapshot.epicQuests.length > 0;

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-6xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col gap-4"
      >
        <motion.nav
          variants={itemVariants}
          className="panel sticky top-4 z-20 mx-auto mb-[6px] w-full max-w-md rounded-[30px] px-3 py-3"
        >
          <DashboardHeaderControls locale={locale} />
          <div className="grid grid-cols-4 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.22em] ${
                  pathname === item.href
                    ? "bg-[var(--titan-action)] text-white shadow-[0_12px_24px_rgba(238,66,102,0.26)]"
                    : "text-[var(--titan-muted)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.nav>

        {visibleSections.hero ? (
          <motion.section
            variants={itemVariants}
            className="panel rounded-[36px] px-5 py-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-kicker">{messages.dashboard.hero.kicker}</p>
                <h1 className="score-text mt-3 text-[clamp(2.4rem,8vw,4rem)] leading-none text-[#fff7de]">
                  TITAN
                </h1>
                <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[var(--titan-muted)]">
                  {snapshot.activeTemplate.summary}
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/20 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--titan-muted)]">
                  {messages.dashboard.hero.pilot}
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
              {messages.dashboard.hero.activeTemplate}
              {" // "}
              {snapshot.activeTemplate.title}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[22px] border border-white/10 bg-black/18 p-3">
                <p className="section-kicker">{messages.dashboard.hero.streak}</p>
                <p className="score-text mt-2 text-3xl text-[#fff7de]">
                  {snapshot.streakDays}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/18 p-3">
                <p className="section-kicker">{messages.dashboard.hero.core}</p>
                <p className="score-text mt-2 text-3xl text-[#fff7de]">
                  {coreProgressLabel}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/18 p-3">
                <p className="section-kicker">{messages.dashboard.hero.boss}</p>
                <p className="score-text mt-2 text-3xl text-[#fff7de]">
                  {bossPercent}
                </p>
              </div>
            </div>
          </motion.section>
        ) : null}

        {visibleSections.monthlyBoss ? (
          <motion.section variants={itemVariants}>
            <MonthlyBossWidget locale={locale} {...snapshot.monthlyBoss} />
          </motion.section>
        ) : null}

        {visibleSections.featuredGoal ? (
          snapshot.featuredGoal ? (
            <motion.section variants={itemVariants}>
              <TitanProgressBar
                locale={locale}
                kicker={messages.dashboard.featuredGoal.kicker}
                title={snapshot.featuredGoal.title}
                caption={snapshot.featuredGoal.summary}
                current={snapshot.featuredGoal.current}
                goal={snapshot.featuredGoal.goal}
                unit={snapshot.featuredGoal.unit}
              />
              {snapshot.featuredGoal.options.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {snapshot.featuredGoal.options.map((option) => (
                    <form key={option.id} action={onApplyQuestProgressOption}>
                      <input type="hidden" name="option_id" value={option.id} />
                      <TitanSubmitButton
                        pendingLabel={messages.dashboard.featuredGoal.pendingBurst}
                        className="panel w-full rounded-[22px] p-3 text-center text-sm font-semibold text-[#fff7de] transition-transform hover:-translate-y-0.5"
                      >
                        <p className="section-kicker">{option.label}</p>
                        <p className="score-text mt-2 text-2xl text-[#fff7de]">
                          +{option.value}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                          x{option.usesToday} {messages.dashboard.featuredGoal.usesToday}
                        </p>
                        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#fff7de]">
                          {messages.dashboard.featuredGoal.addBurst}
                        </p>
                      </TitanSubmitButton>
                    </form>
                  ))}
                </div>
              ) : (
                <div className="mt-3">
                  <TitanEmptyPanel
                    kicker={messages.dashboard.featuredGoal.kicker}
                    title={messages.dashboard.featuredGoal.noBurstTitle}
                    description={messages.dashboard.featuredGoal.noBurstDescription}
                    hint={messages.dashboard.featuredGoal.noBurstHint}
                  />
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section variants={itemVariants}>
              <TitanEmptyPanel
                kicker={messages.dashboard.featuredGoal.kicker}
                title={messages.dashboard.featuredGoal.noCounterTitle}
                description={messages.dashboard.featuredGoal.noCounterDescription}
                hint={messages.dashboard.featuredGoal.noCounterHint}
              />
            </motion.section>
          )
        ) : null}

        {visibleSections.dailyQuests ? (
          <motion.section variants={itemVariants}>
            <SectionHeader
              eyebrow={messages.dashboard.sections.dailyEyebrow}
              title={messages.dashboard.sections.dailyTitle}
              caption={snapshot.activeTemplate.successRuleLabel}
            />
            {snapshot.dailyQuests.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {snapshot.dailyQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    locale={locale}
                    onToggleDailyQuest={onToggleDailyQuest}
                    featuredQuestId={featuredQuestId}
                  />
                ))}
              </div>
            ) : (
              <TitanEmptyPanel
                kicker={messages.dashboard.sections.dailyEyebrow}
                title={messages.dashboard.sections.dailyEmptyTitle}
                description={messages.dashboard.sections.dailyEmptyDescription}
                hint={messages.dashboard.sections.dailyEmptyHint}
              />
            )}
          </motion.section>
        ) : null}

        {visibleSections.secondaryQuests ? (
          <motion.section variants={itemVariants}>
            <SectionHeader
              eyebrow={messages.dashboard.sections.secondaryEyebrow}
              title={messages.dashboard.sections.secondaryTitle}
              caption={messages.dashboard.sections.secondaryCaption}
            />
            {hasSecondaryQuests ? (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {[
                  ...snapshot.weeklyQuests,
                  ...snapshot.monthlyQuests,
                  ...snapshot.epicQuests,
                ].map((quest) => (
                  <QuestCard key={quest.id} quest={quest} locale={locale} />
                ))}
              </div>
            ) : (
              <TitanEmptyPanel
                kicker={messages.dashboard.sections.secondaryEyebrow}
                title={messages.dashboard.sections.secondaryEmptyTitle}
                description={messages.dashboard.sections.secondaryEmptyDescription}
                hint={messages.dashboard.sections.secondaryEmptyHint}
              />
            )}
          </motion.section>
        ) : null}

        {visibleSections.rewards ? (
          <motion.section variants={itemVariants}>
            <SectionHeader
              eyebrow={messages.dashboard.sections.lootEyebrow}
              title={messages.dashboard.sections.lootTitle}
              caption={messages.dashboard.sections.lootCaption}
            />
            {snapshot.rewards.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {snapshot.rewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} locale={locale} />
                ))}
              </div>
            ) : (
              <TitanEmptyPanel
                kicker={messages.dashboard.sections.lootEyebrow}
                title={messages.dashboard.sections.lootEmptyTitle}
                description={messages.dashboard.sections.lootEmptyDescription}
                hint={messages.dashboard.sections.lootEmptyHint}
              />
            )}
          </motion.section>
        ) : null}

        {children ? (
          <motion.section variants={itemVariants}>{children}</motion.section>
        ) : null}
      </motion.div>
    </main>
  );
}
