PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  success_target INTEGER NOT NULL CHECK (success_target > 0),
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_logs (
  date TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS monthly_stats (
  month TEXT NOT NULL,
  template_id TEXT NOT NULL,
  engagement_score REAL NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 1),
  successful_days INTEGER NOT NULL CHECK (successful_days >= 0),
  total_days INTEGER NOT NULL CHECK (total_days >= 0),
  threshold REAL NOT NULL DEFAULT 0.7 CHECK (threshold >= 0 AND threshold <= 1),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (month, template_id),
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary')),
  xp_cost INTEGER NOT NULL CHECK (xp_cost >= 0),
  unlocked INTEGER NOT NULL DEFAULT 0 CHECK (unlocked IN (0, 1)),
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quests (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'epic')),
  progress_kind TEXT NOT NULL CHECK (progress_kind IN ('boolean', 'counter')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  cadence_label TEXT NOT NULL,
  reward_label TEXT NOT NULL,
  xp_value INTEGER NOT NULL CHECK (xp_value >= 0),
  is_core INTEGER NOT NULL DEFAULT 0 CHECK (is_core IN (0, 1)),
  target_value INTEGER CHECK (target_value >= 0),
  unit TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quest_progress (
  quest_id TEXT PRIMARY KEY,
  current_value INTEGER NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quest_progress_options (
  id TEXT PRIMARY KEY,
  quest_id TEXT NOT NULL,
  label TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value > 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_log_entries (
  date TEXT NOT NULL,
  quest_id TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  value INTEGER NOT NULL DEFAULT 0 CHECK (value >= 0),
  PRIMARY KEY (date, quest_id),
  FOREIGN KEY (date) REFERENCES daily_logs(date) ON DELETE CASCADE,
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_option_uses (
  date TEXT NOT NULL,
  option_id TEXT NOT NULL,
  uses_count INTEGER NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
  PRIMARY KEY (date, option_id),
  FOREIGN KEY (date) REFERENCES daily_logs(date) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES quest_progress_options(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quest_rewards (
  quest_id TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  PRIMARY KEY (quest_id, reward_id),
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_templates_order
  ON templates(display_order);

CREATE INDEX IF NOT EXISTS idx_quests_template_type_order
  ON quests(template_id, type, display_order);

CREATE INDEX IF NOT EXISTS idx_rewards_order
  ON rewards(display_order);

CREATE INDEX IF NOT EXISTS idx_quest_progress_options_order
  ON quest_progress_options(quest_id, display_order);

CREATE INDEX IF NOT EXISTS idx_daily_log_entries_quest
  ON daily_log_entries(quest_id, date);
