export type QuestType = "daily" | "weekly" | "monthly" | "epic";

export interface DailyLog {
  date: string;
  anastrozol: boolean;
  igh: boolean;
  protein_total: number;
  sport_done: boolean;
}

export interface MonthlyStats {
  month: string;
  engagement_score: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  rarity: "common" | "rare" | "legendary";
  xpCost: number;
  unlocked: boolean;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  summary: string;
  cadenceLabel: string;
  progressLabel: string;
  rewardLabel: string;
  xpValue: number;
  completed: boolean;
}

export interface ProteinOption {
  id: string;
  label: string;
  grams: number;
  usesToday: number;
}

export interface MonthlyBossSnapshot {
  month: string;
  engagementScore: number;
  threshold: number;
  completedDays: number;
  totalDays: number;
}

export interface DashboardSnapshot {
  pilotName: string;
  todayLabel: string;
  streakDays: number;
  dailyLog: DailyLog;
  monthlyStats: MonthlyStats;
  proteinGoal: number;
  proteinOptions: ProteinOption[];
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  monthlyQuests: Quest[];
  epicQuests: Quest[];
  rewards: Reward[];
  monthlyBoss: MonthlyBossSnapshot;
}

export function getCompletedCoreTasks(log: DailyLog, proteinGoal: number): number {
  return [
    log.anastrozol,
    log.igh,
    log.protein_total >= proteinGoal,
    log.sport_done,
  ].filter(Boolean).length;
}

export function isSuccessfulDay(log: DailyLog, proteinGoal: number): boolean {
  return getCompletedCoreTasks(log, proteinGoal) >= 3;
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
