import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const rootDir = process.cwd();
const databasePath = process.env.TITAN_DB_PATH
  ? path.resolve(process.env.TITAN_DB_PATH)
  : path.join(rootDir, "data", "titan.local.db");
const migrationPath = path.join(rootDir, "db", "migrations", "0001_initial.sql");
const seedPath = path.join(rootDir, "db", "seeds", "0001_seed.sql");

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

if (fs.existsSync(databasePath)) {
  fs.unlinkSync(databasePath);
}

const database = new Database(databasePath);

try {
  database.pragma("foreign_keys = ON");
  database.exec(fs.readFileSync(migrationPath, "utf8"));
  database.exec(fs.readFileSync(seedPath, "utf8"));
} finally {
  database.close();
}

console.log(`TITAN database initialized at ${databasePath}`);
