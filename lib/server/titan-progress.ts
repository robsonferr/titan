import "server-only";

import {
  DEFAULT_BOSS_THRESHOLD,
  getQuestCompletion,
  isSuccessfulDay,
  type AppSettingRecord,
  type QuestProgressKind,
  type QuestType,
} from "@/lib/titan";
import {
  executeBatch,
  getTitanDatabase,
  queryAll,
  queryFirst,
  type TitanDatabase,
} from "@/lib/server/database";

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

async function getSettingMap(
  database: TitanDatabase,
): Promise<Record<string, string>> {
  const rows = await queryAll<AppSettingRecord>(
    "SELECT key, value FROM app_settings ORDER BY key",
    [],
    database,
  );

  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

async function getBossThreshold(database: TitanDatabase): Promise<number> {
  const settings = await getSettingMap(database);
  return Number(settings.boss_threshold ?? DEFAULT_BOSS_THRESHOLD);
}

async function getQuestMutationRow(
  questId: string,
  database: TitanDatabase,
): Promise<QuestMutationRow> {
  const row = await queryFirst<QuestMutationRow>(
    `
      SELECT id, template_id, type, progress_kind, target_value
      FROM quests
      WHERE id = ?
    `,
    [questId],
    database,
  );

  if (!row) {
    throw new Error(`Missing quest record for id ${questId}`);
  }

  return row;
}

async function getProgressOptionMutationRow(
  optionId: string,
  database: TitanDatabase,
): Promise<ProgressOptionMutationRow> {
  const row = await queryFirst<ProgressOptionMutationRow>(
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
    [optionId],
    database,
  );

  if (!row) {
    throw new Error(`Missing progress option for id ${optionId}`);
  }

  return row;
}

async function recomputeMonthlyState(
  database: TitanDatabase,
  templateId: string,
  date: string,
): Promise<void> {
  const month = getMonthKey(date);
  const monthPattern = `${month}-%`;
  const [threshold, coreQuests, logs, entries, settings, successTargetRow] =
    await Promise.all([
      getBossThreshold(database),
      queryAll<CoreQuestRow>(
        `
          SELECT id, progress_kind, target_value
          FROM quests
          WHERE template_id = ? AND type = 'daily' AND is_core = 1
          ORDER BY display_order ASC
        `,
        [templateId],
        database,
      ),
      queryAll<{ date: string }>(
        `
          SELECT date
          FROM daily_logs
          WHERE template_id = ? AND date LIKE ?
          ORDER BY date ASC
        `,
        [templateId, monthPattern],
        database,
      ),
      queryAll<DailyEntryRow>(
        `
          SELECT e.date, e.template_id, e.quest_id, e.completed, e.value
          FROM daily_log_entries e
          INNER JOIN quests q ON q.id = e.quest_id
          WHERE e.template_id = ? AND q.template_id = ? AND q.type = 'daily' AND q.is_core = 1 AND e.date LIKE ?
        `,
        [templateId, templateId, monthPattern],
        database,
      ),
      getSettingMap(database),
      queryFirst<{ success_target: number }>(
        `
          SELECT success_target
          FROM templates
          WHERE id = ?
        `,
        [templateId],
        database,
      ),
    ]);

  if (!successTargetRow) {
    throw new Error(`Missing template record for id ${templateId}`);
  }

  const entriesByDate = entries.reduce<Map<string, Map<string, DailyEntryRow>>>(
    (accumulator, entry) => {
      const bucket = accumulator.get(entry.date) ?? new Map<string, DailyEntryRow>();
      bucket.set(entry.quest_id, entry);
      accumulator.set(entry.date, bucket);
      return accumulator;
    },
    new Map(),
  );

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
  const monthlyBossQuest = await queryFirst<{ id: string; target_value: number | null }>(
    `
      SELECT id, target_value
      FROM quests
      WHERE template_id = ? AND id = 'monthly-boss'
      LIMIT 1
    `,
    [templateId],
    database,
  );
  const statements = [
    {
      sql: `
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
      params: [month, templateId, engagementScore, successfulDays, totalDays, threshold],
    },
    ...(monthlyBossQuest
      ? [
          {
            sql: `
              INSERT INTO quest_progress (quest_id, current_value, completed)
              VALUES (?, ?, ?)
              ON CONFLICT(quest_id) DO UPDATE SET
                current_value = excluded.current_value,
                completed = excluded.completed,
                updated_at = CURRENT_TIMESTAMP
            `,
            params: [
              monthlyBossQuest.id,
              Math.round(engagementScore * 100),
              Math.round(engagementScore * 100) >=
              (monthlyBossQuest.target_value ?? Math.round(threshold * 100))
                ? 1
                : 0,
            ],
          },
        ]
      : []),
    ...(settings.active_template_id === templateId
      ? [
          {
            sql: `
              INSERT INTO app_settings (key, value)
              VALUES ('current_month_key', ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value
            `,
            params: [month],
          },
        ]
      : []),
  ];

  await executeBatch(statements, database);
}

export async function toggleDailyBooleanQuest(questId: string): Promise<void> {
  const database = await getTitanDatabase();
  const quest = await getQuestMutationRow(questId, database);

  if (quest.type !== "daily" || quest.progress_kind !== "boolean") {
    throw new Error("Only daily boolean quests can be toggled directly.");
  }

  const date = getTodayIsoDate();
  const currentEntry = await queryFirst<{ completed: number; value: number }>(
    `
      SELECT completed, value
      FROM daily_log_entries
      WHERE date = ? AND template_id = ? AND quest_id = ?
    `,
    [date, quest.template_id, quest.id],
    database,
  );
  const nextCompleted = currentEntry?.completed === 1 ? 0 : 1;

  await executeBatch(
    [
      {
        sql: `
          INSERT INTO daily_logs (date, template_id)
          VALUES (?, ?)
          ON CONFLICT(date, template_id) DO UPDATE SET
            updated_at = CURRENT_TIMESTAMP
        `,
        params: [date, quest.template_id],
      },
      {
        sql: `
          INSERT INTO daily_log_entries (date, template_id, quest_id, completed, value)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(date, quest_id) DO UPDATE SET
            template_id = excluded.template_id,
            completed = excluded.completed,
            value = excluded.value
        `,
        params: [date, quest.template_id, quest.id, nextCompleted, nextCompleted],
      },
    ],
    database,
  );

  await recomputeMonthlyState(database, quest.template_id, date);
}

export async function applyQuestProgressOption(optionId: string): Promise<void> {
  const database = await getTitanDatabase();
  const option = await getProgressOptionMutationRow(optionId, database);

  if (option.type !== "daily" || option.progress_kind !== "counter") {
    throw new Error("Quick-add progress only applies to daily counter quests.");
  }

  const date = getTodayIsoDate();
  const currentEntry = await queryFirst<{ completed: number; value: number }>(
    `
      SELECT completed, value
      FROM daily_log_entries
      WHERE date = ? AND template_id = ? AND quest_id = ?
    `,
    [date, option.template_id, option.quest_id],
    database,
  );
  const nextValue = (currentEntry?.value ?? 0) + option.value;
  const completed =
    option.target_value !== null && nextValue >= option.target_value ? 1 : 0;

  await executeBatch(
    [
      {
        sql: `
          INSERT INTO daily_logs (date, template_id)
          VALUES (?, ?)
          ON CONFLICT(date, template_id) DO UPDATE SET
            updated_at = CURRENT_TIMESTAMP
        `,
        params: [date, option.template_id],
      },
      {
        sql: `
          INSERT INTO daily_log_entries (date, template_id, quest_id, completed, value)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(date, quest_id) DO UPDATE SET
            template_id = excluded.template_id,
            completed = excluded.completed,
            value = excluded.value
        `,
        params: [date, option.template_id, option.quest_id, completed, nextValue],
      },
      {
        sql: `
          INSERT INTO daily_option_uses (date, template_id, option_id, uses_count)
          VALUES (?, ?, ?, 1)
          ON CONFLICT(date, option_id) DO UPDATE SET
            template_id = excluded.template_id,
            uses_count = daily_option_uses.uses_count + 1
        `,
        params: [date, option.template_id, option.id],
      },
    ],
    database,
  );

  await recomputeMonthlyState(database, option.template_id, date);
}
