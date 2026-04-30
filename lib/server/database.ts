import "server-only";

import fs from "node:fs";
import path from "node:path";

import BetterSqlite3 from "better-sqlite3";

type SqliteDatabase = InstanceType<typeof BetterSqlite3>;

let database: SqliteDatabase | null = null;

export function requiresTitanProductionPersistenceConfig(): boolean {
  return process.env.NODE_ENV === "production" && !process.env.TITAN_DB_PATH;
}

export function getTitanDatabasePath(): string {
  const customPath = process.env.TITAN_DB_PATH;

  if (customPath) {
    return path.isAbsolute(customPath)
      ? customPath
      : path.join(/* turbopackIgnore: true */ process.cwd(), customPath);
  }

  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", "titan.local.db");
}

export function titanDatabaseExists(): boolean {
  return fs.existsSync(getTitanDatabasePath());
}

export function getSqliteDatabase(): SqliteDatabase {
  if (database) {
    return database;
  }

  if (requiresTitanProductionPersistenceConfig()) {
    throw new Error(
      "TITAN_DB_PATH is required in production. Point it to a writable SQLite file on a persistent volume before starting the hosted app.",
    );
  }

  const databasePath = getTitanDatabasePath();

  if (!fs.existsSync(databasePath)) {
    throw new Error(
      `TITAN database not found at ${databasePath}. Run "npm run db:init" before starting the app.`,
    );
  }

  database = new BetterSqlite3(databasePath, {
    fileMustExist: true,
  });
  database.pragma("foreign_keys = ON");

  return database;
}
