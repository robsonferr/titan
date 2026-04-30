import "server-only";

import type { QuestProgressKind, QuestType, RewardRarity } from "@/lib/titan";
import {
  executeBatch,
  executeStatement,
  getTitanDatabase,
  queryFirst,
  type TitanDatabase,
} from "@/lib/server/database";

type OrderedTable =
  | "templates"
  | "quests"
  | "rewards"
  | "quest_progress_options";

type ExistingTable = "templates" | "quests" | "rewards";

type ParentColumn = "template_id" | "quest_id";

interface ParentKey {
  column: ParentColumn;
  value: string;
}

const NEXT_DISPLAY_ORDER_SQL: Record<OrderedTable, string> = {
  templates:
    "SELECT COALESCE(MAX(display_order), 0) AS max_order FROM templates",
  quests: "SELECT COALESCE(MAX(display_order), 0) AS max_order FROM quests",
  rewards: "SELECT COALESCE(MAX(display_order), 0) AS max_order FROM rewards",
  quest_progress_options:
    "SELECT COALESCE(MAX(display_order), 0) AS max_order FROM quest_progress_options",
};

const NEXT_DISPLAY_ORDER_BY_PARENT_SQL: Record<
  OrderedTable,
  Partial<Record<ParentColumn, string>>
> = {
  templates: {},
  quests: {
    template_id:
      "SELECT COALESCE(MAX(display_order), 0) AS max_order FROM quests WHERE template_id = ?",
  },
  rewards: {},
  quest_progress_options: {
    quest_id:
      "SELECT COALESCE(MAX(display_order), 0) AS max_order FROM quest_progress_options WHERE quest_id = ?",
  },
};

const FIND_BY_ID_SQL: Record<OrderedTable, string> = {
  templates: "SELECT id FROM templates WHERE id = ? LIMIT 1",
  quests: "SELECT id FROM quests WHERE id = ? LIMIT 1",
  rewards: "SELECT id FROM rewards WHERE id = ? LIMIT 1",
  quest_progress_options:
    "SELECT id FROM quest_progress_options WHERE id = ? LIMIT 1",
};

const ENSURE_EXISTS_SQL: Record<ExistingTable, string> = {
  templates: FIND_BY_ID_SQL.templates,
  quests: FIND_BY_ID_SQL.quests,
  rewards: FIND_BY_ID_SQL.rewards,
};

interface CreateTemplateInput {
  title: string;
  summary: string;
  successTarget: number;
  slugBase: string;
}

interface CreateRewardInput {
  title: string;
  description: string;
  rarity: RewardRarity;
  xpCost: number;
  unlocked: boolean;
  slugBase: string;
}

interface CreateQuestInput {
  templateId: string;
  type: QuestType;
  progressKind: QuestProgressKind;
  title: string;
  summary: string;
  xpValue: number;
  rewardId: string | null;
  isCore: boolean;
  targetValue: number | null;
  unit: string | null;
  slugBase: string;
}

interface CreateQuestProgressOptionInput {
  questId: string;
  label: string;
  value: number;
  slugBase: string;
}

async function getNextDisplayOrder(
  table: OrderedTable,
  database: TitanDatabase,
  parentKey?: ParentKey,
): Promise<number> {
  if (!parentKey) {
    const sql = NEXT_DISPLAY_ORDER_SQL[table];
    const row = await queryFirst<{ max_order: number }>(sql, [], database);
    return (row?.max_order ?? 0) + 1;
  }

  const sql = NEXT_DISPLAY_ORDER_BY_PARENT_SQL[table][parentKey.column];

  if (!sql) {
    throw new Error("TITAN_INTERNAL_ERROR");
  }

  const row = await queryFirst<{ max_order: number }>(
    sql,
    [parentKey.value],
    database,
  );

  return (row?.max_order ?? 0) + 1;
}

async function createUniqueId(
  table: OrderedTable,
  base: string,
  database: TitanDatabase,
): Promise<string> {
  const sql = FIND_BY_ID_SQL[table];
  let candidate = base;
  let suffix = 2;

  while (
    await queryFirst<{ id: string }>(sql, [candidate], database)
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function ensureRecordExists(
  table: ExistingTable,
  id: string,
  database: TitanDatabase,
): Promise<void> {
  const row = await queryFirst<{ id: string }>(
    ENSURE_EXISTS_SQL[table],
    [id],
    database,
  );

  if (!row) {
    throw new Error("TITAN_NOT_FOUND");
  }
}

function getCadenceLabel(type: QuestType): string {
  switch (type) {
    case "daily":
      return "Daily Quest";
    case "weekly":
      return "Weekly Quest";
    case "monthly":
      return "Monthly Boss";
    case "epic":
      return "Epic Quest";
  }
}

export async function createTemplateRecord({
  title,
  summary,
  successTarget,
  slugBase,
}: CreateTemplateInput): Promise<void> {
  const database = await getTitanDatabase();
  const id = await createUniqueId("templates", slugBase, database);
  const displayOrder = await getNextDisplayOrder("templates", database);

  await executeStatement(
    `
      INSERT INTO templates (id, title, summary, success_target, display_order)
      VALUES (?, ?, ?, ?, ?)
    `,
    [id, title, summary, successTarget, displayOrder],
    database,
  );
}

export async function setActiveTemplateRecord(templateId: string): Promise<void> {
  const database = await getTitanDatabase();

  await ensureRecordExists("templates", templateId, database);
  await executeStatement(
    `
      INSERT INTO app_settings (key, value)
      VALUES ('active_template_id', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    [templateId],
    database,
  );
}

export async function createRewardRecord({
  title,
  description,
  rarity,
  xpCost,
  unlocked,
  slugBase,
}: CreateRewardInput): Promise<void> {
  const database = await getTitanDatabase();
  const id = await createUniqueId("rewards", `reward-${slugBase}`, database);
  const displayOrder = await getNextDisplayOrder("rewards", database);

  await executeStatement(
    `
      INSERT INTO rewards (id, title, description, rarity, xp_cost, unlocked, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [id, title, description, rarity, xpCost, unlocked ? 1 : 0, displayOrder],
    database,
  );
}

export async function createQuestRecord({
  templateId,
  type,
  progressKind,
  title,
  summary,
  xpValue,
  rewardId,
  isCore,
  targetValue,
  unit,
  slugBase,
}: CreateQuestInput): Promise<void> {
  const database = await getTitanDatabase();
  const id = await createUniqueId("quests", `${type}-${slugBase}`, database);
  const displayOrder = await getNextDisplayOrder("quests", database, {
    column: "template_id",
    value: templateId,
  });

  await ensureRecordExists("templates", templateId, database);

  if (rewardId) {
    await ensureRecordExists("rewards", rewardId, database);
  }

  await executeBatch(
    [
      {
        sql: `
          INSERT INTO quests (
            id,
            template_id,
            type,
            progress_kind,
            title,
            summary,
            cadence_label,
            reward_label,
            xp_value,
            is_core,
            target_value,
            unit,
            display_order
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          id,
          templateId,
          type,
          progressKind,
          title,
          summary,
          getCadenceLabel(type),
          "Reward link available in Forge",
          xpValue,
          isCore ? 1 : 0,
          targetValue,
          unit,
          displayOrder,
        ],
      },
      ...(type !== "daily"
        ? [
            {
              sql: `
                INSERT INTO quest_progress (quest_id, current_value, completed)
                VALUES (?, 0, 0)
              `,
              params: [id],
            },
          ]
        : []),
      ...(rewardId
        ? [
            {
              sql: `DELETE FROM quest_rewards WHERE quest_id = ?`,
              params: [id],
            },
            {
              sql: `
                INSERT INTO quest_rewards (quest_id, reward_id)
                VALUES (?, ?)
              `,
              params: [id, rewardId],
            },
          ]
        : []),
    ],
    database,
  );
}

export async function createQuestProgressOptionRecord({
  questId,
  label,
  value,
  slugBase,
}: CreateQuestProgressOptionInput): Promise<void> {
  const database = await getTitanDatabase();
  const id = await createUniqueId(
    "quest_progress_options",
    `${questId}-${slugBase}`,
    database,
  );
  const displayOrder = await getNextDisplayOrder("quest_progress_options", database, {
    column: "quest_id",
    value: questId,
  });
  const questRow = await queryFirst<{ progress_kind: QuestProgressKind }>(
    `
      SELECT progress_kind
      FROM quests
      WHERE id = ?
    `,
    [questId],
    database,
  );

  if (!questRow) {
    throw new Error("TITAN_NOT_FOUND");
  }

  if (questRow.progress_kind !== "counter") {
    throw new Error("TITAN_INVALID_PROGRESS_KIND");
  }

  await executeStatement(
    `
      INSERT INTO quest_progress_options (id, quest_id, label, value, display_order)
      VALUES (?, ?, ?, ?, ?)
    `,
    [id, questId, label, value, displayOrder],
    database,
  );
}

export async function attachRewardToQuestRecord(
  questId: string,
  rewardId: string,
): Promise<void> {
  const database = await getTitanDatabase();

  await ensureRecordExists("quests", questId, database);
  await ensureRecordExists("rewards", rewardId, database);

  await executeBatch(
    [
      {
        sql: `DELETE FROM quest_rewards WHERE quest_id = ?`,
        params: [questId],
      },
      {
        sql: `
          INSERT INTO quest_rewards (quest_id, reward_id)
          VALUES (?, ?)
        `,
        params: [questId, rewardId],
      },
    ],
    database,
  );
}
