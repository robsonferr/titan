"use server";

import { revalidatePath } from "next/cache";

import type { QuestProgressKind, QuestType, RewardRarity } from "@/lib/titan";
import { getSqliteDatabase } from "@/lib/server/database";

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    throw new Error(`Missing field: ${key}`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`Empty field: ${key}`);
  }

  return normalized;
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function requireInteger(
  formData: FormData,
  key: string,
  minimum = 0,
): number {
  const value = Number(requireString(formData, key));

  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(`Invalid numeric field: ${key}`);
  }

  return value;
}

function readOptionalInteger(formData: FormData, key: string): number | null {
  const rawValue = readOptionalString(formData, key);

  if (rawValue === null) {
    return null;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid numeric field: ${key}`);
  }

  return value;
}

function readBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function requireQuestType(formData: FormData, key: string): QuestType {
  const value = requireString(formData, key);

  if (!["daily", "weekly", "monthly", "epic"].includes(value)) {
    throw new Error(`Invalid quest type: ${value}`);
  }

  return value as QuestType;
}

function requireProgressKind(
  formData: FormData,
  key: string,
): QuestProgressKind {
  const value = requireString(formData, key);

  if (!["boolean", "counter"].includes(value)) {
    throw new Error(`Invalid quest progress kind: ${value}`);
  }

  return value as QuestProgressKind;
}

function requireRarity(formData: FormData, key: string): RewardRarity {
  const value = requireString(formData, key);

  if (!["common", "rare", "legendary"].includes(value)) {
    throw new Error(`Invalid reward rarity: ${value}`);
  }

  return value as RewardRarity;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "item";
}

function getNextDisplayOrder(
  table: "templates" | "quests" | "rewards" | "quest_progress_options",
  parentKey?: { column: "template_id" | "quest_id"; value: string },
): number {
  const database = getSqliteDatabase();

  if (!parentKey) {
    const row = database
      .prepare(`SELECT COALESCE(MAX(display_order), 0) AS max_order FROM ${table}`)
      .get() as { max_order: number };

    return row.max_order + 1;
  }

  const row = database
    .prepare(
      `SELECT COALESCE(MAX(display_order), 0) AS max_order FROM ${table} WHERE ${parentKey.column} = ?`,
    )
    .get(parentKey.value) as { max_order: number };

  return row.max_order + 1;
}

function createUniqueId(
  table: "templates" | "quests" | "rewards" | "quest_progress_options",
  base: string,
): string {
  const database = getSqliteDatabase();
  const statement = database.prepare(`SELECT 1 FROM ${table} WHERE id = ? LIMIT 1`);
  let candidate = base;
  let suffix = 2;

  while (statement.get(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function ensureRecordExists(
  table: "templates" | "quests" | "rewards",
  id: string,
): void {
  const database = getSqliteDatabase();
  const row = database
    .prepare(`SELECT 1 FROM ${table} WHERE id = ? LIMIT 1`)
    .get(id);

  if (!row) {
    throw new Error(`Missing ${table} record for id ${id}`);
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

export async function createTemplateAction(formData: FormData): Promise<void> {
  const database = getSqliteDatabase();
  const title = requireString(formData, "title");
  const summary = requireString(formData, "summary");
  const successTarget = requireInteger(formData, "success_target", 1);
  const id = createUniqueId("templates", slugify(title));
  const displayOrder = getNextDisplayOrder("templates");

  database
    .prepare(
      `
        INSERT INTO templates (id, title, summary, success_target, display_order)
        VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(id, title, summary, successTarget, displayOrder);

  revalidatePath("/");
}

export async function setActiveTemplateAction(formData: FormData): Promise<void> {
  const templateId = requireString(formData, "template_id");
  const database = getSqliteDatabase();

  ensureRecordExists("templates", templateId);

  database
    .prepare(
      `
        INSERT INTO app_settings (key, value)
        VALUES ('active_template_id', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `,
    )
    .run(templateId);

  revalidatePath("/");
}

export async function createRewardAction(formData: FormData): Promise<void> {
  const database = getSqliteDatabase();
  const title = requireString(formData, "title");
  const description = requireString(formData, "description");
  const rarity = requireRarity(formData, "rarity");
  const xpCost = requireInteger(formData, "xp_cost", 0);
  const unlocked = readBoolean(formData, "unlocked") ? 1 : 0;
  const id = createUniqueId("rewards", `reward-${slugify(title)}`);
  const displayOrder = getNextDisplayOrder("rewards");

  database
    .prepare(
      `
        INSERT INTO rewards (id, title, description, rarity, xp_cost, unlocked, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(id, title, description, rarity, xpCost, unlocked, displayOrder);

  revalidatePath("/");
}

export async function createQuestAction(formData: FormData): Promise<void> {
  const database = getSqliteDatabase();
  const templateId = requireString(formData, "template_id");
  const type = requireQuestType(formData, "type");
  const progressKind = requireProgressKind(formData, "progress_kind");
  const title = requireString(formData, "title");
  const summary = requireString(formData, "summary");
  const xpValue = requireInteger(formData, "xp_value", 0);
  const rewardId = readOptionalString(formData, "reward_id");
  const isCore = readBoolean(formData, "is_core") ? 1 : 0;
  const targetValue = progressKind === "counter" ? readOptionalInteger(formData, "target_value") : null;
  const unit = progressKind === "counter" ? readOptionalString(formData, "unit") : null;
  const id = createUniqueId("quests", `${type}-${slugify(title)}`);
  const displayOrder = getNextDisplayOrder("quests", {
    column: "template_id",
    value: templateId,
  });
  const cadenceLabel = getCadenceLabel(type);

  ensureRecordExists("templates", templateId);

  if (rewardId) {
    ensureRecordExists("rewards", rewardId);
  }

  const transaction = database.transaction(() => {
    database
      .prepare(
        `
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
      )
      .run(
        id,
        templateId,
        type,
        progressKind,
        title,
        summary,
        cadenceLabel,
        "Reward link available in Forge",
        xpValue,
        isCore,
        targetValue,
        unit,
        displayOrder,
      );

    if (type !== "daily") {
      database
        .prepare(
          `
            INSERT INTO quest_progress (quest_id, current_value, completed)
            VALUES (?, 0, 0)
          `,
        )
        .run(id);
    }

    if (rewardId) {
      database
        .prepare(`DELETE FROM quest_rewards WHERE quest_id = ?`)
        .run(id);
      database
        .prepare(
          `
            INSERT INTO quest_rewards (quest_id, reward_id)
            VALUES (?, ?)
          `,
        )
        .run(id, rewardId);
    }
  });

  transaction();
  revalidatePath("/");
}

export async function createQuestProgressOptionAction(
  formData: FormData,
): Promise<void> {
  const database = getSqliteDatabase();
  const questId = requireString(formData, "quest_id");
  const label = requireString(formData, "label");
  const value = requireInteger(formData, "value", 1);
  const id = createUniqueId("quest_progress_options", `${questId}-${slugify(label)}`);
  const displayOrder = getNextDisplayOrder("quest_progress_options", {
    column: "quest_id",
    value: questId,
  });
  const questRow = database
    .prepare(
      `
        SELECT progress_kind
        FROM quests
        WHERE id = ?
      `,
    )
    .get(questId) as { progress_kind: QuestProgressKind } | undefined;

  if (!questRow) {
    throw new Error(`Missing quest record for id ${questId}`);
  }

  if (questRow.progress_kind !== "counter") {
    throw new Error("Progress options can only be added to counter quests.");
  }

  database
    .prepare(
      `
        INSERT INTO quest_progress_options (id, quest_id, label, value, display_order)
        VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(id, questId, label, value, displayOrder);

  revalidatePath("/");
}

export async function attachRewardToQuestAction(
  formData: FormData,
): Promise<void> {
  const database = getSqliteDatabase();
  const questId = requireString(formData, "quest_id");
  const rewardId = requireString(formData, "reward_id");

  ensureRecordExists("quests", questId);
  ensureRecordExists("rewards", rewardId);

  const transaction = database.transaction(() => {
    database.prepare(`DELETE FROM quest_rewards WHERE quest_id = ?`).run(questId);
    database
      .prepare(
        `
          INSERT INTO quest_rewards (quest_id, reward_id)
          VALUES (?, ?)
        `,
      )
      .run(questId, rewardId);
  });

  transaction();
  revalidatePath("/");
}
