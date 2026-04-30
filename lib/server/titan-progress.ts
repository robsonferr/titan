import "server-only";

import BetterSqlite3 from "better-sqlite3";

import {
  DEFAULT_BOSS_THRESHOLD,
  getQuestCompletion,
  isSuccessfulDay,
  type AppSettingRecord,
  type QuestProgressKind,
  type QuestType,
} from "@/lib/titan";
import { getSqliteDatabase } from "@/lib/server/database";

type SqliteDatabase = InstanceType<typeof BetterSqlite3>;

interface QuestMutationRow {
  id: string;
  template_id: string;
  type: QuestType;
  progress_kind: QuestProgressKind;
  target_value: number | null;
}

interface ProgressOptionMutationRow {
  id: string;
  value: number;
  quest_id: string;
  template_id: string;
  type: QuestType;
  progress_kind: QuestProgressKind;
  target_value: number | null;
}

interface CoreQuestRow {
  id: string;
  progress_kind: QuestProgressKind;
  target_value: number | null;
}

interface DailyEntryRow {
  date: string;
  template_id: string;
  quest_id: string;
  completed: number;
  value: number;
}

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getMonthKey(date: string): string {
  return date.slice(0, 7);
}

function getSettingMap(database: SqliteDatabase): Record<string, string> {
  const rows = database
    .prepare("SELECT key, value FROM app_settings ORDER BY key")
    .all() as AppSettingRecord[];

  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

function getBossThreshold(database: SqliteDatabase): number {
  const settings = getSettingMap(database);
  return Number(settings.boss_threshold ?? DEFAULT_BOSS_THRESHOLD);
}

function ensureDailyLog(
  database: SqliteDatabase,
  templateId: string,
  date: string,
): void {
  database
    .prepare(
      `
        INSERT INTO daily_logs (date, template_id)
        VALUES (?, ?)
        ON CONFLICT(date, template_id) DO UPDATE SET
          updated_at = CURRENT_TIMESTAMP
      `,
    )
    .run(date, templateId);
}

function getQuestMutationRow(questId: string): QuestMutationRow {
  const database = getSqliteDatabase();
  const row = database
    .prepare(
      `
        SELECT id, template_id, type, progress_kind, target_value
        FROM quests
        WHERE id = ?
      `,
    )
    .get(questId) as QuestMutationRow | undefined;

  if (!row) {
    throw new Error(`Missing quest record for id ${questId}`);
  }

  return row;
}

function getProgressOptionMutationRow(optionId: string): ProgressOptionMutationRow {
  const database = getSqliteDatabase();
  const row = database
    .prepare(
      `
        SELECT
          qpo.id,
          qpo.value,
          q.id AS quest_id,
          q.template_id,
          q.type,
          q.progress_kind,
          q.target_value
        FROM quest_progress_options qpo
        INNER JOIN quests q ON q.id = qpo.quest_id
        WHERE qpo.id = ?
      `,
    )
    .get(optionId) as ProgressOptionMutationRow | undefined;

  if (!row) {
    throw new Error(`Missing progress option for id ${optionId}`);
  }

  return row;
}

function recomputeMonthlyState(
  database: SqliteDatabase,
  templateId: string,
  date: string,
): void {
  const month = getMonthKey(date);
  const threshold = getBossThreshold(database);
  const monthPattern = `${month}-%`;
  const coreQuests = database
    .prepare(
      `
        SELECT id, progress_kind, target_value
        FROM quests
        WHERE template_id = ? AND type = 'daily' AND is_core = 1
        ORDER BY display_order ASC
      `,
    )
    .all(templateId) as CoreQuestRow[];
  const logs = database
    .prepare(
      `
        SELECT date
        FROM daily_logs
        WHERE template_id = ? AND date LIKE ?
        ORDER BY date ASC
      `,
    )
    .all(templateId, monthPattern) as Array<{ date: string }>;
  const entries = database
    .prepare(
      `
        SELECT e.date, e.template_id, e.quest_id, e.completed, e.value
        FROM daily_log_entries e
        INNER JOIN quests q ON q.id = e.quest_id
        WHERE e.template_id = ? AND q.template_id = ? AND q.type = 'daily' AND q.is_core = 1 AND e.date LIKE ?
      `,
    )
    .all(templateId, templateId, monthPattern) as DailyEntryRow[];

  const entriesByDate = entries.reduce<Map<string, Map<string, DailyEntryRow>>>(
    (accumulator, entry) => {
      const bucket = accumulator.get(entry.date) ?? new Map<string, DailyEntryRow>();
      bucket.set(entry.quest_id, entry);
      accumulator.set(entry.date, bucket);
      return accumulator;
    },
    new Map(),
  );

  const settings = getSettingMap(database);
  const successTargetRow = database
    .prepare(
      `
        SELECT success_target
        FROM templates
        WHERE id = ?
      `,
    )
    .get(templateId) as { success_target: number } | undefined;

  if (!successTargetRow) {
    throw new Error(`Missing template record for id ${templateId}`);
  }

  const successfulDays = logs.reduce((count, log) => {
    const entriesForDate = entriesByDate.get(log.date) ?? new Map<string, DailyEntryRow>();
    const completedCoreQuests = coreQuests.filter((quest) => {
      const entry = entriesForDate.get(quest.id);
      return getQuestCompletion(
        quest.progress_kind,
        entry?.value ?? 0,
        quest.target_value,
        entry?.completed === 1,
      );
    }).length;

    return count +
      (coreQuests.length > 0 &&
      isSuccessfulDay(completedCoreQuests, successTargetRow.success_target)
        ? 1
        : 0);
  }, 0);
  const totalDays = logs.length;
  const engagementScore = totalDays === 0 ? 0 : successfulDays / totalDays;

  database
    .prepare(
      `
        INSERT INTO monthly_stats (
          month,
          template_id,
          engagement_score,
          successful_days,
          total_days,
          threshold
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(month, template_id) DO UPDATE SET
          engagement_score = excluded.engagement_score,
          successful_days = excluded.successful_days,
          total_days = excluded.total_days,
          threshold = excluded.threshold,
          updated_at = CURRENT_TIMESTAMP
      `,
    )
    .run(month, templateId, engagementScore, successfulDays, totalDays, threshold);

  const monthlyBossQuest = database
    .prepare(
      `
        SELECT id, target_value
        FROM quests
        WHERE template_id = ? AND id = 'monthly-boss'
        LIMIT 1
      `,
    )
    .get(templateId) as { id: string; target_value: number | null } | undefined;

  if (monthlyBossQuest) {
    const currentValue = Math.round(engagementScore * 100);
    const targetValue =
      monthlyBossQuest.target_value ?? Math.round(threshold * 100);
    const completed = currentValue >= targetValue ? 1 : 0;

    database
      .prepare(
        `
          INSERT INTO quest_progress (quest_id, current_value, completed)
          VALUES (?, ?, ?)
          ON CONFLICT(quest_id) DO UPDATE SET
            current_value = excluded.current_value,
            completed = excluded.completed,
            updated_at = CURRENT_TIMESTAMP
        `,
      )
      .run(monthlyBossQuest.id, currentValue, completed);
  }

  if (settings.active_template_id === templateId) {
    database
      .prepare(
        `
          INSERT INTO app_settings (key, value)
          VALUES ('current_month_key', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `,
      )
      .run(month);
  }
}

export function toggleDailyBooleanQuest(questId: string): void {
  const database = getSqliteDatabase();
  const quest = getQuestMutationRow(questId);

  if (quest.type !== "daily" || quest.progress_kind !== "boolean") {
    throw new Error("Only daily boolean quests can be toggled directly.");
  }

  const date = getTodayIsoDate();
  const transaction = database.transaction(() => {
    ensureDailyLog(database, quest.template_id, date);

    const currentEntry = database
      .prepare(
        `
          SELECT completed, value
          FROM daily_log_entries
          WHERE date = ? AND template_id = ? AND quest_id = ?
        `,
      )
      .get(date, quest.template_id, quest.id) as
      | { completed: number; value: number }
      | undefined;
    const nextCompleted = currentEntry?.completed === 1 ? 0 : 1;

    database
      .prepare(
        `
          INSERT INTO daily_log_entries (date, template_id, quest_id, completed, value)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(date, quest_id) DO UPDATE SET
            template_id = excluded.template_id,
            completed = excluded.completed,
            value = excluded.value
        `,
      )
      .run(date, quest.template_id, quest.id, nextCompleted, nextCompleted);

    recomputeMonthlyState(database, quest.template_id, date);
  });

  transaction();
}

export function applyQuestProgressOption(optionId: string): void {
  const database = getSqliteDatabase();
  const option = getProgressOptionMutationRow(optionId);

  if (option.type !== "daily" || option.progress_kind !== "counter") {
    throw new Error("Quick-add progress only applies to daily counter quests.");
  }

  const date = getTodayIsoDate();
  const transaction = database.transaction(() => {
    ensureDailyLog(database, option.template_id, date);

    const currentEntry = database
      .prepare(
        `
          SELECT completed, value
          FROM daily_log_entries
          WHERE date = ? AND template_id = ? AND quest_id = ?
        `,
      )
      .get(date, option.template_id, option.quest_id) as
      | { completed: number; value: number }
      | undefined;
    const nextValue = (currentEntry?.value ?? 0) + option.value;
    const completed =
      option.target_value !== null && nextValue >= option.target_value ? 1 : 0;

    database
      .prepare(
        `
          INSERT INTO daily_log_entries (date, template_id, quest_id, completed, value)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(date, quest_id) DO UPDATE SET
            template_id = excluded.template_id,
            completed = excluded.completed,
            value = excluded.value
        `,
      )
      .run(date, option.template_id, option.quest_id, completed, nextValue);

    database
      .prepare(
        `
          INSERT INTO daily_option_uses (date, template_id, option_id, uses_count)
          VALUES (?, ?, ?, 1)
          ON CONFLICT(date, option_id) DO UPDATE SET
            template_id = excluded.template_id,
            uses_count = daily_option_uses.uses_count + 1
        `,
      )
      .run(date, option.template_id, option.id);

    recomputeMonthlyState(database, option.template_id, date);
  });

  transaction();
}
