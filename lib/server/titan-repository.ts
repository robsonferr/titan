import "server-only";

import { cache } from "react";

import {
  DEFAULT_BOSS_THRESHOLD,
  type AppSettingRecord,
  type DailyLog,
  type DailyLogEntryRecord,
  type DailyLogRecord,
  type DailyOptionUseRecord,
  type DashboardSnapshot,
  type FeaturedGoalSnapshot,
  type ManagementSnapshot,
  type MonthlyStatsRecord,
  type Quest,
  type QuestProgressOption,
  type QuestProgressOptionRecord,
  type QuestProgressRecord,
  type QuestRecord,
  type QuestSummary,
  type QuestType,
  type Reward,
  type RewardRecord,
  type RewardSummary,
  type Template,
  type TemplateRecord,
  type TemplateSummary,
  getBossMood,
  getCompletedCoreQuests,
  getQuestCompletion,
  getSuccessRuleLabel,
  isSuccessfulDay,
} from "@/lib/titan";
import {
  TITAN_D1_BINDING,
  getTitanDatabase,
  isMissingTitanBindingError,
  isMissingTitanSchemaError,
  queryAll,
  queryFirst,
  type TitanDatabase,
} from "@/lib/server/database";
import { getTodayIsoDate } from "@/lib/server/titan-progress";

type TitanAppState =
  | {
      kind: "missing_binding";
      bindingName: string;
      configLocation: string;
    }
  | {
      kind: "empty_database";
      bindingName: string;
    }
  | {
      kind: "missing_schema";
      bindingName: string;
    }
  | {
      kind: "ready";
      snapshot: DashboardSnapshot;
    };

interface TemplateSummaryRow extends TemplateRecord {
  quest_count: number;
  core_quest_count: number;
}

interface QuestSummaryRow extends QuestRecord {
  template_title: string;
  progress_option_count: number;
}

interface RewardSummaryRow extends RewardRecord {
  linked_quest_count: number;
}

function toBoolean(value: number): boolean {
  return value === 1;
}

function formatTodayLabel(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00Z`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  })
    .format(parsedDate)
    .replace(", ", " // ");
}

function minusDays(date: string, days: number): string {
  const parsedDate = new Date(`${date}T00:00:00Z`);
  parsedDate.setUTCDate(parsedDate.getUTCDate() - days);

  return parsedDate.toISOString().slice(0, 10);
}

function getSettingMap(records: AppSettingRecord[]): Record<string, string> {
  return Object.fromEntries(records.map((record) => [record.key, record.value]));
}

function mapTemplate(
  record: TemplateRecord,
  totalCoreQuests: number,
): Template {
  return {
    id: record.id,
    title: record.title,
    summary: record.summary,
    successTarget: record.success_target,
    successRuleLabel: getSuccessRuleLabel(record.success_target, totalCoreQuests),
  };
}

function mapTemplateSummary(
  record: TemplateSummaryRow,
  activeTemplateId: string,
): TemplateSummary {
  return {
    id: record.id,
    title: record.title,
    summary: record.summary,
    successTarget: record.success_target,
    successRuleLabel: getSuccessRuleLabel(
      record.success_target,
      record.core_quest_count,
    ),
    questCount: record.quest_count,
    coreQuestCount: record.core_quest_count,
    isActive: record.id === activeTemplateId,
  };
}

function mapReward(record: RewardRecord): Reward {
  return {
    id: record.id,
    title: `Loot // ${record.title}`,
    description: record.description,
    rarity: record.rarity,
    xpCost: record.xp_cost,
    unlocked: toBoolean(record.unlocked),
  };
}

function mapRewardSummary(record: RewardSummaryRow): RewardSummary {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    rarity: record.rarity,
    xpCost: record.xp_cost,
    unlocked: toBoolean(record.unlocked),
    linkedQuestCount: record.linked_quest_count,
  };
}

function mapQuestSummary(record: QuestSummaryRow): QuestSummary {
  return {
    id: record.id,
    templateId: record.template_id,
    templateTitle: record.template_title,
    type: record.type,
    progressKind: record.progress_kind,
    title: record.title,
    summary: record.summary,
    isCore: toBoolean(record.is_core),
    targetValue: record.target_value,
    unit: record.unit,
    xpValue: record.xp_value,
    rewardId: record.reward_id,
    rewardTitle: record.reward_title,
    progressOptionCount: record.progress_option_count,
  };
}

function buildQuestProgressLabel(quest: {
  progressKind: Quest["progressKind"];
  currentValue: number;
  targetValue: number | null;
  unit: string | null;
  completed: boolean;
  type: QuestType;
}): string {
  if (quest.progressKind === "counter" && quest.targetValue !== null) {
    const unitSuffix = quest.unit ? ` ${quest.unit}` : "";
    return `${quest.currentValue} / ${quest.targetValue}${unitSuffix}`;
  }

  if (quest.completed) {
    return "Cleared";
  }

  return quest.type === "daily" ? "Ready" : "Charging";
}

function splitQuestsByType(quests: Quest[]): Record<QuestType, Quest[]> {
  return quests.reduce<Record<QuestType, Quest[]>>(
    (accumulator, quest) => {
      accumulator[quest.type].push(quest);
      return accumulator;
    },
    {
      daily: [],
      weekly: [],
      monthly: [],
      epic: [],
    },
  );
}

function buildDailyEntryMap(
  entries: DailyLogEntryRecord[],
): Map<string, DailyLogEntryRecord> {
  return new Map(entries.map((entry) => [entry.quest_id, entry]));
}

function buildProgressMap(
  records: QuestProgressRecord[],
): Map<string, QuestProgressRecord> {
  return new Map(records.map((record) => [record.quest_id, record]));
}

function buildOptionUseMap(records: DailyOptionUseRecord[]): Map<string, number> {
  return new Map(records.map((record) => [record.option_id, record.uses_count]));
}

function deriveQuest(
  record: QuestRecord,
  dailyEntriesByQuestId: Map<string, DailyLogEntryRecord>,
  progressByQuestId: Map<string, QuestProgressRecord>,
): Quest {
  const dailyEntry = dailyEntriesByQuestId.get(record.id);
  const progressRecord = progressByQuestId.get(record.id);
  const currentValue =
    record.type === "daily" ? dailyEntry?.value ?? 0 : progressRecord?.current_value ?? 0;
  const completedFlag =
    record.type === "daily"
      ? toBoolean(dailyEntry?.completed ?? 0)
      : toBoolean(progressRecord?.completed ?? 0);
  const completed = getQuestCompletion(
    record.progress_kind,
    currentValue,
    record.target_value,
    completedFlag,
  );

  return {
    id: record.id,
    type: record.type,
    progressKind: record.progress_kind,
    title: record.title,
    summary: record.summary,
    cadenceLabel: record.cadence_label,
    progressLabel: buildQuestProgressLabel({
      progressKind: record.progress_kind,
      currentValue,
      targetValue: record.target_value,
      unit: record.unit,
      completed,
      type: record.type,
    }),
    rewardLabel: record.reward_title
      ? `Reward: ${record.reward_title}`
      : record.reward_label,
    xpValue: record.xp_value,
    completed,
    isCore: toBoolean(record.is_core),
    currentValue,
    targetValue: record.target_value,
    unit: record.unit,
  };
}

function computeDailyLog(
  date: string,
  templateId: string,
  dailyQuests: Quest[],
  successTarget: number,
): DailyLog {
  const totalCoreQuests = dailyQuests.filter((quest) => quest.isCore).length;
  const completedCoreQuests = getCompletedCoreQuests(dailyQuests);

  return {
    date,
    templateId,
    completedCoreQuests,
    totalCoreQuests,
    successful: totalCoreQuests > 0 && isSuccessfulDay(completedCoreQuests, successTarget),
  };
}

function computeStreakDays(
  logs: DailyLogRecord[],
  coreQuestRecords: QuestRecord[],
  dailyEntries: DailyLogEntryRecord[],
  successTarget: number,
): number {
  if (logs.length === 0 || coreQuestRecords.length === 0) {
    return 0;
  }

  const latestDate = logs[0].date;
  const entriesByDate = dailyEntries.reduce<Map<string, DailyLogEntryRecord[]>>(
    (accumulator, entry) => {
      const bucket = accumulator.get(entry.date);

      if (bucket) {
        bucket.push(entry);
      } else {
        accumulator.set(entry.date, [entry]);
      }

      return accumulator;
    },
    new Map(),
  );
  let streakDays = 0;

  for (const log of logs) {
    const expectedDate = minusDays(latestDate, streakDays);

    if (log.date !== expectedDate) {
      break;
    }

    const entriesForDate = buildDailyEntryMap(entriesByDate.get(log.date) ?? []);
    const completedCoreQuests = coreQuestRecords.filter((record) => {
      const entry = entriesForDate.get(record.id);
      return getQuestCompletion(
        record.progress_kind,
        entry?.value ?? 0,
        record.target_value,
        toBoolean(entry?.completed ?? 0),
      );
    }).length;

    if (!isSuccessfulDay(completedCoreQuests, successTarget)) {
      break;
    }

    streakDays += 1;
  }

  return streakDays;
}

function buildFeaturedGoal(
  dailyQuests: Quest[],
  options: QuestProgressOptionRecord[],
  optionUses: Map<string, number>,
): FeaturedGoalSnapshot | null {
  const featuredQuest = dailyQuests.find(
    (quest) => quest.progressKind === "counter" && quest.targetValue !== null,
  );

  if (!featuredQuest || featuredQuest.targetValue === null) {
    return null;
  }

  const featuredOptions = options
    .filter((option) => option.quest_id === featuredQuest.id)
    .map<QuestProgressOption>((option) => ({
      id: option.id,
      label: option.label,
      value: option.value,
      usesToday: optionUses.get(option.id) ?? 0,
    }));

  return {
    questId: featuredQuest.id,
    title: featuredQuest.title,
    summary: featuredQuest.summary,
    current: featuredQuest.currentValue,
    goal: featuredQuest.targetValue,
    unit: featuredQuest.unit ?? "pts",
    options: featuredOptions,
  };
}

async function queryQuestRecords(
  database: TitanDatabase,
  templateId: string,
): Promise<QuestRecord[]> {
  return queryAll<QuestRecord>(
    `
      SELECT
        q.id,
        q.template_id,
        q.type,
        q.progress_kind,
        q.title,
        q.summary,
        q.cadence_label,
        q.reward_label,
        q.xp_value,
        q.is_core,
        q.target_value,
        q.unit,
        q.display_order,
        (
          SELECT qr.reward_id
          FROM quest_rewards qr
          WHERE qr.quest_id = q.id
          ORDER BY qr.reward_id ASC
          LIMIT 1
        ) AS reward_id,
        (
          SELECT r.title
          FROM quest_rewards qr
          INNER JOIN rewards r ON r.id = qr.reward_id
          WHERE qr.quest_id = q.id
          ORDER BY r.title ASC
          LIMIT 1
        ) AS reward_title
      FROM quests q
      WHERE q.template_id = ?
      ORDER BY q.display_order ASC
    `,
    [templateId],
    database,
  );
}

export const getTitanAppState = cache(async (): Promise<TitanAppState> => {
  let database: TitanDatabase;

  try {
    database = await getTitanDatabase();
  } catch (error) {
    if (isMissingTitanBindingError(error)) {
      return {
        kind: "missing_binding",
        bindingName: TITAN_D1_BINDING,
        configLocation: "wrangler.jsonc -> d1_databases[].binding",
      };
    }

    throw error;
  }

  let settingsRows: AppSettingRecord[];
  let templateRecords: TemplateRecord[];

  try {
    [settingsRows, templateRecords] = await Promise.all([
      queryAll<AppSettingRecord>(
        "SELECT key, value FROM app_settings ORDER BY key",
        [],
        database,
      ),
      queryAll<TemplateRecord>(
        `
          SELECT id, title, summary, success_target, display_order
          FROM templates
          ORDER BY display_order ASC
        `,
        [],
        database,
      ),
    ]);
  } catch (error) {
    if (isMissingTitanSchemaError(error)) {
      return {
        kind: "missing_schema",
        bindingName: TITAN_D1_BINDING,
      };
    }

    throw error;
  }

  const settings = getSettingMap(settingsRows);
  const bossThreshold = Number(settings.boss_threshold ?? DEFAULT_BOSS_THRESHOLD);
  const playerName =
    settings.player_name ?? settings.pilot_name ?? settings.player_label ?? "Pilot";

  if (templateRecords.length === 0) {
    return {
      kind: "empty_database",
      bindingName: TITAN_D1_BINDING,
    };
  }

  const activeTemplateRecord =
    templateRecords.find((record) => record.id === settings.active_template_id) ??
    templateRecords[0];
  const questRecords = await queryQuestRecords(database, activeTemplateRecord.id);
  const totalCoreQuests = questRecords.filter(
    (record) => record.type === "daily" && toBoolean(record.is_core),
  ).length;
  const activeTemplate = mapTemplate(activeTemplateRecord, totalCoreQuests);
  const activeDate = getTodayIsoDate();
  const currentMonth = activeDate.slice(0, 7);
  const [
    monthlyStatsRow,
    latestDailyEntries,
    questProgressRecords,
    progressOptionRecords,
    dailyOptionUseRecords,
    rewardRecords,
    recentDailyLogs,
    recentDailyEntries,
  ] = await Promise.all([
    queryFirst<MonthlyStatsRecord>(
      `
        SELECT month, template_id, engagement_score, successful_days, total_days, threshold
        FROM monthly_stats
        WHERE month = ? AND template_id = ?
      `,
      [currentMonth, activeTemplate.id],
      database,
    ),
    queryAll<DailyLogEntryRecord>(
      `
        SELECT e.date, e.template_id, e.quest_id, e.completed, e.value
        FROM daily_log_entries e
        INNER JOIN quests q ON q.id = e.quest_id
        WHERE e.date = ? AND e.template_id = ? AND q.template_id = ?
      `,
      [activeDate, activeTemplate.id, activeTemplate.id],
      database,
    ),
    queryAll<QuestProgressRecord>(
      `
        SELECT qp.quest_id, qp.current_value, qp.completed
        FROM quest_progress qp
        INNER JOIN quests q ON q.id = qp.quest_id
        WHERE q.template_id = ?
      `,
      [activeTemplate.id],
      database,
    ),
    queryAll<QuestProgressOptionRecord>(
      `
        SELECT qpo.id, qpo.quest_id, qpo.label, qpo.value, qpo.display_order
        FROM quest_progress_options qpo
        INNER JOIN quests q ON q.id = qpo.quest_id
        WHERE q.template_id = ?
        ORDER BY qpo.display_order ASC
      `,
      [activeTemplate.id],
      database,
    ),
    queryAll<DailyOptionUseRecord>(
      `
        SELECT dou.date, dou.template_id, dou.option_id, dou.uses_count
        FROM daily_option_uses dou
        INNER JOIN quest_progress_options qpo ON qpo.id = dou.option_id
        INNER JOIN quests q ON q.id = qpo.quest_id
        WHERE dou.date = ? AND dou.template_id = ? AND q.template_id = ?
      `,
      [activeDate, activeTemplate.id, activeTemplate.id],
      database,
    ),
    queryAll<RewardRecord>(
      `
        SELECT id, title, description, rarity, xp_cost, unlocked, display_order
        FROM rewards
        ORDER BY display_order ASC
      `,
      [],
      database,
    ),
    queryAll<DailyLogRecord>(
      `
        SELECT date, template_id
        FROM daily_logs
        WHERE template_id = ?
        ORDER BY date DESC
        LIMIT 31
      `,
      [activeTemplate.id],
      database,
    ),
    queryAll<DailyLogEntryRecord>(
      `
        SELECT e.date, e.template_id, e.quest_id, e.completed, e.value
        FROM daily_log_entries e
        INNER JOIN quests q ON q.id = e.quest_id
        INNER JOIN (
          SELECT date, template_id
          FROM daily_logs
          WHERE template_id = ?
          ORDER BY date DESC
          LIMIT 31
        ) recent ON recent.date = e.date AND recent.template_id = e.template_id
        WHERE e.template_id = ? AND q.template_id = ?
      `,
      [activeTemplate.id, activeTemplate.id, activeTemplate.id],
      database,
    ),
  ]);
  const monthlyStatsRecord = monthlyStatsRow ?? {
    month: currentMonth,
    template_id: activeTemplate.id,
    engagement_score: 0,
    successful_days: 0,
    total_days: 0,
    threshold: bossThreshold,
  };
  const rewards = rewardRecords.map(mapReward);

  const dailyEntriesByQuestId = buildDailyEntryMap(latestDailyEntries);
  const progressByQuestId = buildProgressMap(questProgressRecords);
  const optionUsesById = buildOptionUseMap(dailyOptionUseRecords);
  const quests = questRecords.map((record) =>
    deriveQuest(record, dailyEntriesByQuestId, progressByQuestId),
  );
  const questsByType = splitQuestsByType(quests);
  const dailyLog = computeDailyLog(
    activeDate,
    activeTemplate.id,
    questsByType.daily,
    activeTemplate.successTarget,
  );
  const streakDays = computeStreakDays(
    recentDailyLogs,
    questRecords.filter((record) => record.type === "daily" && toBoolean(record.is_core)),
    recentDailyEntries,
    activeTemplate.successTarget,
  );
  const featuredGoal = buildFeaturedGoal(
    questsByType.daily,
    progressOptionRecords,
    optionUsesById,
  );
  const bossMood = getBossMood(
    monthlyStatsRecord.engagement_score,
    monthlyStatsRecord.threshold,
  );
  const monthlyQuests = questsByType.monthly.map((quest) =>
    quest.id === "monthly-boss"
      ? {
          ...quest,
          title: `Monthly Boss // ${bossMood}`,
        }
      : quest,
  );

  return {
    kind: "ready",
    snapshot: {
      playerName,
      todayLabel: formatTodayLabel(activeDate),
      streakDays,
      activeTemplate,
      dailyLog,
      monthlyStats: {
        month: monthlyStatsRecord.month,
        engagement_score: monthlyStatsRecord.engagement_score,
      },
      featuredGoal,
      dailyQuests: questsByType.daily,
      weeklyQuests: questsByType.weekly,
      monthlyQuests,
      epicQuests: questsByType.epic,
      rewards,
      monthlyBoss: {
        month: monthlyStatsRecord.month,
        engagementScore: monthlyStatsRecord.engagement_score,
        threshold: monthlyStatsRecord.threshold,
        completedDays: monthlyStatsRecord.successful_days,
        totalDays: monthlyStatsRecord.total_days,
        successRuleLabel: activeTemplate.successRuleLabel,
      },
    },
  };
});

export const getTitanManagementSnapshot = cache(
  async (): Promise<ManagementSnapshot> => {
    const database = await getTitanDatabase();
    const [settingsRows, templateRows, questRows, rewardRows] = await Promise.all([
      queryAll<AppSettingRecord>(
        "SELECT key, value FROM app_settings ORDER BY key",
        [],
        database,
      ),
      queryAll<TemplateSummaryRow>(
        `
          SELECT
            t.id,
            t.title,
            t.summary,
            t.success_target,
            t.display_order,
            COUNT(q.id) AS quest_count,
            COALESCE(SUM(q.is_core), 0) AS core_quest_count
          FROM templates t
          LEFT JOIN quests q ON q.template_id = t.id
          GROUP BY t.id, t.title, t.summary, t.success_target, t.display_order
          ORDER BY t.display_order ASC
        `,
        [],
        database,
      ),
      queryAll<QuestSummaryRow>(
        `
          SELECT
            q.id,
            q.template_id,
            q.type,
            q.progress_kind,
            q.title,
            q.summary,
            q.cadence_label,
            q.reward_label,
            q.xp_value,
            q.is_core,
            q.target_value,
            q.unit,
            q.display_order,
            (
              SELECT qr.reward_id
              FROM quest_rewards qr
              WHERE qr.quest_id = q.id
              ORDER BY qr.reward_id ASC
              LIMIT 1
            ) AS reward_id,
            (
              SELECT r.title
              FROM quest_rewards qr
              INNER JOIN rewards r ON r.id = qr.reward_id
              WHERE qr.quest_id = q.id
              ORDER BY r.title ASC
              LIMIT 1
            ) AS reward_title,
            t.title AS template_title,
            (
              SELECT COUNT(*)
              FROM quest_progress_options qpo
              WHERE qpo.quest_id = q.id
            ) AS progress_option_count
          FROM quests q
          INNER JOIN templates t ON t.id = q.template_id
          ORDER BY t.display_order ASC, q.display_order ASC
        `,
        [],
        database,
      ),
      queryAll<RewardSummaryRow>(
        `
          SELECT
            r.id,
            r.title,
            r.description,
            r.rarity,
            r.xp_cost,
            r.unlocked,
            r.display_order,
            (
              SELECT COUNT(*)
              FROM quest_rewards qr
              WHERE qr.reward_id = r.id
            ) AS linked_quest_count
          FROM rewards r
          ORDER BY r.display_order ASC
        `,
        [],
        database,
      ),
    ]);
    const settings = getSettingMap(settingsRows);
    const activeTemplateId =
      templateRows.find((row) => row.id === settings.active_template_id)?.id ??
      templateRows[0]?.id ??
      "";

    return {
      activeTemplateId,
      templates: templateRows.map((row) => mapTemplateSummary(row, activeTemplateId)),
      quests: questRows.map(mapQuestSummary),
      rewards: rewardRows.map(mapRewardSummary),
    };
  },
);
