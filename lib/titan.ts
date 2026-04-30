export type QuestType = "daily" | "weekly" | "monthly" | "epic";
export type QuestProgressKind = "boolean" | "counter";
export type RewardRarity = "common" | "rare" | "legendary";

export const DEFAULT_BOSS_THRESHOLD = 0.7;

export interface Template {
  id: string;
  title: string;
  summary: string;
  successTarget: number;
  successRuleLabel: string;
}

export interface TemplateSummary {
  id: string;
  title: string;
  summary: string;
  successTarget: number;
  successRuleLabel: string;
  questCount: number;
  coreQuestCount: number;
  isActive: boolean;
}

export interface DailyLog {
  date: string;
  templateId: string;
  completedCoreQuests: number;
  totalCoreQuests: number;
  successful: boolean;
}

export interface MonthlyStats {
  month: string;
  engagement_score: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  rarity: RewardRarity;
  xpCost: number;
  unlocked: boolean;
}

export interface RewardSummary {
  id: string;
  title: string;
  description: string;
  rarity: RewardRarity;
  xpCost: number;
  unlocked: boolean;
  linkedQuestCount: number;
}

export interface Quest {
  id: string;
  type: QuestType;
  progressKind: QuestProgressKind;
  title: string;
  summary: string;
  cadenceLabel: string;
  progressLabel: string;
  rewardLabel: string;
  xpValue: number;
  completed: boolean;
  isCore: boolean;
  currentValue: number;
  targetValue: number | null;
  unit: string | null;
}

export interface QuestSummary {
  id: string;
  templateId: string;
  templateTitle: string;
  type: QuestType;
  progressKind: QuestProgressKind;
  title: string;
  summary: string;
  isCore: boolean;
  targetValue: number | null;
  unit: string | null;
  xpValue: number;
  rewardId: string | null;
  rewardTitle: string | null;
  progressOptionCount: number;
}

export interface QuestProgressOption {
  id: string;
  label: string;
  value: number;
  usesToday: number;
}

export interface FeaturedGoalSnapshot {
  questId: string;
  title: string;
  summary: string;
  current: number;
  goal: number;
  unit: string;
  options: QuestProgressOption[];
}

export interface MonthlyBossSnapshot {
  month: string;
  engagementScore: number;
  threshold: number;
  completedDays: number;
  totalDays: number;
  successRuleLabel: string;
}

export interface ManagementSnapshot {
  activeTemplateId: string;
  templates: TemplateSummary[];
  quests: QuestSummary[];
  rewards: RewardSummary[];
}

export interface DashboardSnapshot {
  playerName: string;
  todayLabel: string;
  streakDays: number;
  activeTemplate: Template;
  dailyLog: DailyLog;
  monthlyStats: MonthlyStats;
  featuredGoal: FeaturedGoalSnapshot | null;
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  monthlyQuests: Quest[];
  epicQuests: Quest[];
  rewards: Reward[];
  monthlyBoss: MonthlyBossSnapshot;
}

export function getCompletedCoreQuests(
  quests: Array<Pick<Quest, "isCore" | "completed">>,
): number {
  return quests.filter((quest) => quest.isCore && quest.completed).length;
}

export function isSuccessfulDay(
  completedCoreQuests: number,
  successTarget: number,
): boolean {
  return completedCoreQuests >= successTarget;
}

export function getSuccessRuleLabel(
  successTarget: number,
  totalCoreQuests: number,
): string {
  if (totalCoreQuests === 0) {
    return "Set core quests to define the daily clear rule.";
  }

  return `${successTarget} of ${totalCoreQuests} core quests clear the day.`;
}

export function getQuestCompletion(
  progressKind: QuestProgressKind,
  currentValue: number,
  targetValue: number | null,
  completedFlag: boolean,
): boolean {
  if (progressKind === "counter") {
    return targetValue !== null ? currentValue >= targetValue : completedFlag;
  }

  return completedFlag;
}

export function getBossMood(score: number, threshold: number): string {
  if (score >= threshold + 0.12) {
    return "Boss cracked";
  }

  if (score >= threshold) {
    return "On the shield";
  }

  return "Danger zone";
}

export interface AppSettingRecord {
  key: string;
  value: string;
}

export interface TemplateRecord {
  id: string;
  title: string;
  summary: string;
  success_target: number;
  display_order: number;
}

export interface DailyLogRecord {
  date: string;
  template_id: string;
}

export interface DailyLogEntryRecord {
  date: string;
  template_id: string;
  quest_id: string;
  completed: number;
  value: number;
}

export interface QuestProgressRecord {
  quest_id: string;
  current_value: number;
  completed: number;
}

export interface QuestProgressOptionRecord {
  id: string;
  quest_id: string;
  label: string;
  value: number;
  display_order: number;
}

export interface DailyOptionUseRecord {
  date: string;
  template_id: string;
  option_id: string;
  uses_count: number;
}

export interface MonthlyStatsRecord {
  month: string;
  template_id: string;
  engagement_score: number;
  successful_days: number;
  total_days: number;
  threshold: number;
}

export interface RewardRecord {
  id: string;
  title: string;
  description: string;
  rarity: RewardRarity;
  xp_cost: number;
  unlocked: number;
  display_order: number;
}

export interface QuestRecord {
  id: string;
  template_id: string;
  type: QuestType;
  progress_kind: QuestProgressKind;
  title: string;
  summary: string;
  cadence_label: string;
  reward_label: string;
  xp_value: number;
  is_core: number;
  target_value: number | null;
  unit: string | null;
  display_order: number;
  reward_id: string | null;
  reward_title: string | null;
}
