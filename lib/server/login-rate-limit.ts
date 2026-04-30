import "server-only";

import {
  executeStatement,
  getTitanDatabase,
  queryFirst,
} from "@/lib/server/database";

const WINDOW_SECONDS = 15 * 60;
const MAX_FAILURES = 5;
const LOCKOUT_SECONDS = 15 * 60;
const STALE_AFTER_SECONDS = 24 * 60 * 60;
const GC_PROBABILITY = 0.05;

interface AttemptRow {
  failures: number;
  window_start: number;
  locked_until: number;
}

interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

async function maybeCollectStaleAttempts(
  database: Awaited<ReturnType<typeof getTitanDatabase>>,
  now: number,
): Promise<void> {
  if (Math.random() > GC_PROBABILITY) {
    return;
  }

  try {
    await executeStatement(
      "DELETE FROM login_attempts WHERE locked_until <= ? AND window_start < ?",
      [now, now - STALE_AFTER_SECONDS],
      database,
    );
  } catch (error) {
    console.error("[titan-auth:gc]", error);
  }
}

export async function checkLoginRateLimit(
  ip: string,
): Promise<RateLimitDecision> {
  const database = await getTitanDatabase();
  const now = nowSeconds();

  await maybeCollectStaleAttempts(database, now);

  const row = await queryFirst<AttemptRow>(
    "SELECT failures, window_start, locked_until FROM login_attempts WHERE ip = ?",
    [ip],
    database,
  );

  if (!row) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (row.locked_until > now) {
    return { allowed: false, retryAfterSeconds: row.locked_until - now };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export async function registerLoginFailure(ip: string): Promise<void> {
  const database = await getTitanDatabase();
  const now = nowSeconds();
  const row = await queryFirst<AttemptRow>(
    "SELECT failures, window_start, locked_until FROM login_attempts WHERE ip = ?",
    [ip],
    database,
  );

  if (!row || now - row.window_start > WINDOW_SECONDS) {
    await executeStatement(
      `
        INSERT INTO login_attempts (ip, failures, window_start, locked_until)
        VALUES (?, 1, ?, 0)
        ON CONFLICT(ip) DO UPDATE SET
          failures = 1,
          window_start = excluded.window_start,
          locked_until = 0
      `,
      [ip, now],
      database,
    );
    return;
  }

  const failures = row.failures + 1;
  const locked_until = failures >= MAX_FAILURES ? now + LOCKOUT_SECONDS : 0;

  await executeStatement(
    `
      UPDATE login_attempts
      SET failures = ?, locked_until = ?
      WHERE ip = ?
    `,
    [failures, locked_until, ip],
    database,
  );
}

export async function registerLoginSuccess(ip: string): Promise<void> {
  const database = await getTitanDatabase();
  await executeStatement(
    "DELETE FROM login_attempts WHERE ip = ?",
    [ip],
    database,
  );
}
