import "server-only";

import fs from "node:fs";
import path from "node:path";

import BetterSqlite3 from "better-sqlite3";

type SqliteDatabase = InstanceType<typeof BetterSqlite3>;

let database: SqliteDatabase | null = null;

export function getTitanDatabasePath(): string {
  if (process.env.TITAN_DB_PATH) {
    return path.resolve(process.env.TITAN_DB_PATH);
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
