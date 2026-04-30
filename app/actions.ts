"use server";

import { revalidatePath } from "next/cache";

import type { QuestProgressKind, QuestType, RewardRarity } from "@/lib/titan";
import {
  attachRewardToQuestRecord,
  createQuestProgressOptionRecord,
  createQuestRecord,
  createRewardRecord,
  createTemplateRecord,
  setActiveTemplateRecord,
} from "@/lib/server/titan-admin";
import {
  applyQuestProgressOption,
  toggleDailyBooleanQuest,
} from "@/lib/server/titan-progress";

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

export async function createTemplateAction(formData: FormData): Promise<void> {
  const title = requireString(formData, "title");

  await createTemplateRecord({
    title,
    summary: requireString(formData, "summary"),
    successTarget: requireInteger(formData, "success_target", 1),
    slugBase: slugify(title),
  });

  revalidatePath("/");
}

export async function setActiveTemplateAction(formData: FormData): Promise<void> {
  await setActiveTemplateRecord(requireString(formData, "template_id"));
  revalidatePath("/");
}

export async function createRewardAction(formData: FormData): Promise<void> {
  const title = requireString(formData, "title");

  await createRewardRecord({
    title,
    description: requireString(formData, "description"),
    rarity: requireRarity(formData, "rarity"),
    xpCost: requireInteger(formData, "xp_cost", 0),
    unlocked: readBoolean(formData, "unlocked"),
    slugBase: slugify(title),
  });

  revalidatePath("/");
}

export async function createQuestAction(formData: FormData): Promise<void> {
  const type = requireQuestType(formData, "type");
  const progressKind = requireProgressKind(formData, "progress_kind");
  const title = requireString(formData, "title");

  await createQuestRecord({
    templateId: requireString(formData, "template_id"),
    type,
    progressKind,
    title,
    summary: requireString(formData, "summary"),
    xpValue: requireInteger(formData, "xp_value", 0),
    rewardId: readOptionalString(formData, "reward_id"),
    isCore: readBoolean(formData, "is_core"),
    targetValue:
      progressKind === "counter"
        ? readOptionalInteger(formData, "target_value")
        : null,
    unit:
      progressKind === "counter" ? readOptionalString(formData, "unit") : null,
    slugBase: slugify(title),
  });

  revalidatePath("/");
}

export async function createQuestProgressOptionAction(
  formData: FormData,
): Promise<void> {
  const label = requireString(formData, "label");

  await createQuestProgressOptionRecord({
    questId: requireString(formData, "quest_id"),
    label,
    value: requireInteger(formData, "value", 1),
    slugBase: slugify(label),
  });

  revalidatePath("/");
}

export async function attachRewardToQuestAction(
  formData: FormData,
): Promise<void> {
  await attachRewardToQuestRecord(
    requireString(formData, "quest_id"),
    requireString(formData, "reward_id"),
  );

  revalidatePath("/");
}

export async function toggleDailyQuestAction(formData: FormData): Promise<void> {
  await toggleDailyBooleanQuest(requireString(formData, "quest_id"));
  revalidatePath("/");
}

export async function applyQuestProgressOptionAction(
  formData: FormData,
): Promise<void> {
  await applyQuestProgressOption(requireString(formData, "option_id"));
  revalidatePath("/");
}
