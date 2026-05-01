"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  buildLocalizedPath,
  getLocaleFromAbsoluteUrl,
  type Locale,
  SUPPORTED_LOCALES,
} from "@/lib/i18n";
import type { QuestProgressKind, QuestType, RewardRarity } from "@/lib/titan";
import { getAuthSession } from "@/lib/server/auth";
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

const FIELD_LIMITS = {
  title: 120,
  summary: 2048,
  description: 2048,
  label: 80,
  unit: 32,
  id: 200,
} as const;

const NUMERIC_LIMITS = {
  successTarget: { min: 1, max: 100 },
  xpCost: { min: 0, max: 1_000_000 },
  xpValue: { min: 0, max: 1_000_000 },
  targetValue: { min: 0, max: 1_000_000 },
  optionValue: { min: 1, max: 10_000 },
} as const;

class ValidationError extends Error {
  constructor() {
    super("TITAN_VALIDATION_ERROR");
    this.name = "TitanValidationError";
  }
}

function requireString(
  formData: FormData,
  key: string,
  maxLength: number,
): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    throw new ValidationError();
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > maxLength) {
    throw new ValidationError();
  }

  return normalized;
}

function readOptionalString(
  formData: FormData,
  key: string,
  maxLength: number,
): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new ValidationError();
  }

  return normalized;
}

function requireInteger(
  formData: FormData,
  key: string,
  minimum: number,
  maximum: number,
): number {
  const raw = requireString(formData, key, 16);
  const value = Number(raw);

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new ValidationError();
  }

  return value;
}

function readOptionalInteger(
  formData: FormData,
  key: string,
  minimum: number,
  maximum: number,
): number | null {
  const rawValue = readOptionalString(formData, key, 16);

  if (rawValue === null) {
    return null;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new ValidationError();
  }

  return value;
}

function readBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function requireQuestType(formData: FormData, key: string): QuestType {
  const value = requireString(formData, key, 16);

  if (value !== "daily" && value !== "weekly" && value !== "monthly" && value !== "epic") {
    throw new ValidationError();
  }

  return value;
}

function requireProgressKind(
  formData: FormData,
  key: string,
): QuestProgressKind {
  const value = requireString(formData, key, 16);

  if (value !== "boolean" && value !== "counter") {
    throw new ValidationError();
  }

  return value;
}

function requireRarity(formData: FormData, key: string): RewardRarity {
  const value = requireString(formData, key, 16);

  if (value !== "common" && value !== "rare" && value !== "legendary") {
    throw new ValidationError();
  }

  return value;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "item";
}

async function runAction(
  name: string,
  fn: () => Promise<void>,
): Promise<void> {
  const headerStore = await headers();
  const referer = headerStore.get("referer");
  const locale = getLocaleFromAbsoluteUrl(referer);
  const currentPath = readActionTarget(referer, locale);
  let session;
  try {
    session = await getAuthSession();
  } catch (error) {
    console.error(`[titan-auth:${name}]`, error);
    throw new Error("TITAN_ACTION_FAILED");
  }

  if (!session) {
    redirect(buildLoginRedirect(locale, currentPath));
  }

  try {
    await fn();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[titan-action:${name}]`, error.message, error.stack);
    } else {
      console.error(`[titan-action:${name}]`, error);
    }
    throw new Error("TITAN_ACTION_FAILED");
  }
}

function buildLoginRedirect(locale: Locale, target: string): string {
  return `${buildLocalizedPath(locale, "/login")}?redirect=${encodeURIComponent(target)}`;
}

function readActionTarget(referer: string | null, locale: Locale): string {
  if (!referer) {
    return buildLocalizedPath(locale);
  }

  try {
    const url = new URL(referer);
    const target = `${url.pathname}${url.search}`;
    return target || buildLocalizedPath(locale);
  } catch {
    return buildLocalizedPath(locale);
  }
}

function revalidateLocalizedDashboard(): void {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(buildLocalizedPath(locale));
  }
}

export async function createTemplateAction(formData: FormData): Promise<void> {
  await runAction("createTemplate", async () => {
    const title = requireString(formData, "title", FIELD_LIMITS.title);

    await createTemplateRecord({
      title,
      summary: requireString(formData, "summary", FIELD_LIMITS.summary),
      successTarget: requireInteger(
        formData,
        "success_target",
        NUMERIC_LIMITS.successTarget.min,
        NUMERIC_LIMITS.successTarget.max,
      ),
      slugBase: slugify(title),
    });

    revalidateLocalizedDashboard();
  });
}

export async function setActiveTemplateAction(
  formData: FormData,
): Promise<void> {
  await runAction("setActiveTemplate", async () => {
    await setActiveTemplateRecord(
      requireString(formData, "template_id", FIELD_LIMITS.id),
    );
    revalidateLocalizedDashboard();
  });
}

export async function createRewardAction(formData: FormData): Promise<void> {
  await runAction("createReward", async () => {
    const title = requireString(formData, "title", FIELD_LIMITS.title);

    await createRewardRecord({
      title,
      description: requireString(
        formData,
        "description",
        FIELD_LIMITS.description,
      ),
      rarity: requireRarity(formData, "rarity"),
      xpCost: requireInteger(
        formData,
        "xp_cost",
        NUMERIC_LIMITS.xpCost.min,
        NUMERIC_LIMITS.xpCost.max,
      ),
      unlocked: readBoolean(formData, "unlocked"),
      slugBase: slugify(title),
    });

    revalidateLocalizedDashboard();
  });
}

export async function createQuestAction(formData: FormData): Promise<void> {
  await runAction("createQuest", async () => {
    const type = requireQuestType(formData, "type");
    const progressKind = requireProgressKind(formData, "progress_kind");
    const title = requireString(formData, "title", FIELD_LIMITS.title);

    await createQuestRecord({
      templateId: requireString(formData, "template_id", FIELD_LIMITS.id),
      type,
      progressKind,
      title,
      summary: requireString(formData, "summary", FIELD_LIMITS.summary),
      xpValue: requireInteger(
        formData,
        "xp_value",
        NUMERIC_LIMITS.xpValue.min,
        NUMERIC_LIMITS.xpValue.max,
      ),
      rewardId: readOptionalString(formData, "reward_id", FIELD_LIMITS.id),
      isCore: readBoolean(formData, "is_core"),
      targetValue:
        progressKind === "counter"
          ? readOptionalInteger(
              formData,
              "target_value",
              NUMERIC_LIMITS.targetValue.min,
              NUMERIC_LIMITS.targetValue.max,
            )
          : null,
      unit:
        progressKind === "counter"
          ? readOptionalString(formData, "unit", FIELD_LIMITS.unit)
          : null,
      slugBase: slugify(title),
    });

    revalidateLocalizedDashboard();
  });
}

export async function createQuestProgressOptionAction(
  formData: FormData,
): Promise<void> {
  await runAction("createQuestProgressOption", async () => {
    const label = requireString(formData, "label", FIELD_LIMITS.label);

    await createQuestProgressOptionRecord({
      questId: requireString(formData, "quest_id", FIELD_LIMITS.id),
      label,
      value: requireInteger(
        formData,
        "value",
        NUMERIC_LIMITS.optionValue.min,
        NUMERIC_LIMITS.optionValue.max,
      ),
      slugBase: slugify(label),
    });

    revalidateLocalizedDashboard();
  });
}

export async function attachRewardToQuestAction(
  formData: FormData,
): Promise<void> {
  await runAction("attachRewardToQuest", async () => {
    await attachRewardToQuestRecord(
      requireString(formData, "quest_id", FIELD_LIMITS.id),
      requireString(formData, "reward_id", FIELD_LIMITS.id),
    );

    revalidateLocalizedDashboard();
  });
}

export async function toggleDailyQuestAction(
  formData: FormData,
): Promise<void> {
  await runAction("toggleDailyQuest", async () => {
    await toggleDailyBooleanQuest(
      requireString(formData, "quest_id", FIELD_LIMITS.id),
    );
    revalidateLocalizedDashboard();
  });
}

export async function applyQuestProgressOptionAction(
  formData: FormData,
): Promise<void> {
  await runAction("applyQuestProgressOption", async () => {
    await applyQuestProgressOption(
      requireString(formData, "option_id", FIELD_LIMITS.id),
    );
    revalidatePath("/");
  });
}
