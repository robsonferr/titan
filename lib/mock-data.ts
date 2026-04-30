import {
  type DashboardSnapshot,
  getBossMood,
  getCompletedCoreTasks,
  isSuccessfulDay,
} from "@/lib/titan";

const proteinGoal = 100;

const dailyLog = {
  date: "2026-04-30",
  anastrozol: true,
  igh: false,
  protein_total: 68,
  sport_done: true,
} as const;

const monthlyBoss = {
  month: "2026-04",
  engagementScore: 0.74,
  threshold: 0.7,
  completedDays: 17,
  totalDays: 23,
} as const;

const completedCoreTasks = getCompletedCoreTasks(dailyLog, proteinGoal);
const successfulDay = isSuccessfulDay(dailyLog, proteinGoal);
const bossMood = getBossMood(
  monthlyBoss.engagementScore,
  monthlyBoss.threshold,
);

export const dashboardSnapshot: DashboardSnapshot = {
  pilotName: "Mateus",
  todayLabel: "Thursday // 30 Apr",
  streakDays: 9,
  dailyLog,
  monthlyStats: {
    month: monthlyBoss.month,
    engagement_score: monthlyBoss.engagementScore,
  },
  proteinGoal,
  proteinOptions: [
    { id: "shake", label: "Shake", grams: 21, usesToday: 1 },
    { id: "carne", label: "Carne", grams: 25, usesToday: 1 },
    { id: "ovo", label: "Ovo", grams: 6, usesToday: 2 },
  ],
  dailyQuests: [
    {
      id: "morning-buff",
      type: "daily",
      title: "Morning Buff",
      summary: "Anastrozol online before the day starts.",
      cadenceLabel: "Daily Quest",
      progressLabel: "Done",
      rewardLabel: "Unlocks +10 XP",
      xpValue: 10,
      completed: true,
    },
    {
      id: "night-protocol",
      type: "daily",
      title: "Night Protocol",
      summary: "iGH check before lights out.",
      cadenceLabel: "Daily Quest",
      progressLabel: "Pending",
      rewardLabel: "Protects monthly streak",
      xpValue: 18,
      completed: false,
    },
    {
      id: "protein-log",
      type: "daily",
      title: "Protein Log",
      summary: `${dailyLog.protein_total}g loaded. Goal is ${proteinGoal}g for full XP.`,
      cadenceLabel: "Daily Quest",
      progressLabel: "68 / 100g",
      rewardLabel: "Boss shield charge",
      xpValue: 24,
      completed: false,
    },
    {
      id: "sport-done",
      type: "daily",
      title: "Arena Move",
      summary: "Track volleyball or swimming to count the fourth core task.",
      cadenceLabel: "Daily Quest",
      progressLabel: "Volleyball ready",
      rewardLabel: "Counts for OKR day",
      xpValue: 16,
      completed: true,
    },
  ],
  weeklyQuests: [
    {
      id: "weekly-volley",
      type: "weekly",
      title: "Weekly Quest // Court Pulse",
      summary: "Finish 3 sport sessions this week to keep momentum high.",
      cadenceLabel: "Weekly Quest",
      progressLabel: "2 / 3 sessions",
      rewardLabel: "Reward: 90 XP + rare loot",
      xpValue: 90,
      completed: false,
    },
  ],
  monthlyQuests: [
    {
      id: "monthly-boss",
      type: "monthly",
      title: `Monthly Boss // ${bossMood}`,
      summary: `${Math.round(monthlyBoss.engagementScore * 100)}% consistency with ${monthlyBoss.completedDays} successful days.`,
      cadenceLabel: "Monthly Boss",
      progressLabel: successfulDay
        ? "Today already counts toward OKR"
        : `${completedCoreTasks}/4 core tasks today`,
      rewardLabel: "Reward: shop unlock at 70%",
      xpValue: 350,
      completed: monthlyBoss.engagementScore >= monthlyBoss.threshold,
    },
  ],
  epicQuests: [
    {
      id: "epic-growth",
      type: "epic",
      title: "Epic Quest // Growth Run",
      summary: "Stack 4 green weeks in a row and trigger a full Titan loot drop.",
      cadenceLabel: "Epic Quest",
      progressLabel: "1 / 4 weeks charged",
      rewardLabel: "Reward: legendary unlock",
      xpValue: 500,
      completed: false,
    },
  ],
  rewards: [
    {
      id: "reward-game-time",
      title: "Loot // Extra game night",
      description: "Unlocked when the Boss stays above 70% consistency.",
      rarity: "rare",
      xpCost: 140,
      unlocked: true,
    },
    {
      id: "reward-swim-kit",
      title: "Loot // Swim upgrade",
      description: "A new gear pick after 2 weekly quests completed.",
      rarity: "legendary",
      xpCost: 280,
      unlocked: false,
    },
    {
      id: "reward-boba",
      title: "Loot // Friday treat",
      description: "Quick win reward tied to streak protection.",
      rarity: "common",
      xpCost: 60,
      unlocked: true,
    },
  ],
  monthlyBoss,
};
