import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export const TITAN_D1_BINDING = "TITAN_DB";

export type TitanDatabase = D1Database;

interface BatchStatement {
  sql: string;
  params?: readonly unknown[];
}

function bindStatement(
  database: TitanDatabase,
  sql: string,
  params: readonly unknown[] = [],
) {
  return database.prepare(sql).bind(...params);
}

export async function getTitanDatabase(): Promise<TitanDatabase> {
  const { env } = await getCloudflareContext({ async: true });
  const database = env.TITAN_DB;

  if (!database) {
    throw new Error("TITAN_MISSING_D1_BINDING");
  }

  return database;
}

export async function queryAll<T>(
  sql: string,
  params: readonly unknown[] = [],
  database?: TitanDatabase,
): Promise<T[]> {
  const connection = database ?? (await getTitanDatabase());
  const result = await bindStatement(connection, sql, params).all<T>();
  return result.results ?? [];
}

export async function queryFirst<T>(
  sql: string,
  params: readonly unknown[] = [],
  database?: TitanDatabase,
): Promise<T | undefined> {
  const connection = database ?? (await getTitanDatabase());
  const result = await bindStatement(connection, sql, params).first<T>();
  return result ?? undefined;
}

export async function executeStatement(
  sql: string,
  params: readonly unknown[] = [],
  database?: TitanDatabase,
): Promise<void> {
  const connection = database ?? (await getTitanDatabase());
  await bindStatement(connection, sql, params).run();
}

export async function executeBatch(
  statements: readonly BatchStatement[],
  database?: TitanDatabase,
): Promise<void> {
  if (statements.length === 0) {
    return;
  }

  const connection = database ?? (await getTitanDatabase());

  await connection.batch(
    statements.map(({ sql, params = [] }) => bindStatement(connection, sql, params)),
  );
}

export function isMissingTitanBindingError(error: unknown): boolean {
  return error instanceof Error && error.message === "TITAN_MISSING_D1_BINDING";
}

export function isMissingTitanSchemaError(error: unknown): boolean {
  return error instanceof Error && /no such table/i.test(error.message);
}
