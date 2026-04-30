PRAGMA foreign_keys = ON;

INSERT OR REPLACE INTO app_settings (key, value) VALUES
  ('player_name', 'Mateus'),
  ('active_template_id', 'balanced-hero'),
  ('boss_threshold', '0.7');

INSERT OR REPLACE INTO templates (id, title, summary, success_target, display_order) VALUES
  ('balanced-hero', 'Balanced Hero', 'A starter template that blends study, movement, and reset habits into one teen-friendly daily run.', 3, 1);

INSERT OR REPLACE INTO daily_logs (date, template_id) VALUES
  ('2026-04-22', 'balanced-hero'),
  ('2026-04-23', 'balanced-hero'),
  ('2026-04-24', 'balanced-hero'),
  ('2026-04-25', 'balanced-hero'),
  ('2026-04-26', 'balanced-hero'),
  ('2026-04-27', 'balanced-hero'),
  ('2026-04-28', 'balanced-hero'),
  ('2026-04-29', 'balanced-hero'),
  ('2026-04-30', 'balanced-hero');

INSERT OR REPLACE INTO monthly_stats (month, template_id, engagement_score, successful_days, total_days, threshold) VALUES
  ('2026-04', 'balanced-hero', 0.7777777778, 7, 9, 0.7);

INSERT OR REPLACE INTO rewards (id, title, description, rarity, xp_cost, unlocked, display_order) VALUES
  ('reward-game-time', 'Extra game night', 'Unlocked when the monthly consistency shield stays above the threshold.', 'rare', 140, 1, 1),
  ('reward-gear-drop', 'Gear drop', 'A better accessory pick after weekly momentum stays alive.', 'legendary', 280, 0, 2),
  ('reward-friday-treat', 'Friday treat', 'Quick win reward tied to daily streak protection.', 'common', 60, 1, 3);

INSERT OR REPLACE INTO quests (
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
) VALUES
  ('morning-momentum', 'balanced-hero', 'daily', 'boolean', 'Morning Momentum', 'Kick off the day with a fast check-in, water, and body wake-up.', 'Daily Quest', 'Reward: Friday treat', 10, 1, NULL, NULL, 1),
  ('focus-sprint', 'balanced-hero', 'daily', 'counter', 'Focus Sprint', 'Stack short study blocks until the deck reaches 50 minutes.', 'Daily Quest', 'Reward: Extra game night', 24, 1, 50, 'min', 2),
  ('arena-move', 'balanced-hero', 'daily', 'boolean', 'Arena Move', 'Log volleyball, swimming, or any movement session to power the run.', 'Daily Quest', 'Reward: Gear drop', 16, 1, NULL, NULL, 3),
  ('night-reset', 'balanced-hero', 'daily', 'boolean', 'Night Reset', 'Close the loop with a quick room reset and device cutoff.', 'Daily Quest', 'Reward: Friday treat', 18, 1, NULL, NULL, 4),
  ('weekly-stack', 'balanced-hero', 'weekly', 'counter', 'Weekly Quest // Stack Builder', 'Complete three strong sessions this week to hold momentum.', 'Weekly Quest', 'Reward: Gear drop', 90, 0, 3, 'sessions', 5),
  ('monthly-boss', 'balanced-hero', 'monthly', 'counter', 'Monthly Boss // Consistency Shield', 'Keep the month above the template threshold and keep the Boss under pressure.', 'Monthly Boss', 'Reward: Extra game night', 350, 0, 70, '%', 6),
  ('epic-reputation', 'balanced-hero', 'epic', 'counter', 'Epic Quest // Reputation Run', 'Chain four strong weeks in a row and trigger a full loot drop.', 'Epic Quest', 'Reward: Gear drop', 500, 0, 4, 'weeks', 7);

INSERT OR REPLACE INTO quest_progress (quest_id, current_value, completed) VALUES
  ('weekly-stack', 2, 0),
  ('monthly-boss', 78, 1),
  ('epic-reputation', 1, 0);

INSERT OR REPLACE INTO quest_progress_options (id, quest_id, label, value, display_order) VALUES
  ('focus-pomodoro', 'focus-sprint', 'Pomodoro', 25, 1),
  ('focus-review', 'focus-sprint', 'Quick review', 15, 2),
  ('focus-reading', 'focus-sprint', 'Reading burst', 10, 3);

INSERT OR REPLACE INTO daily_log_entries (date, quest_id, completed, value) VALUES
  ('2026-04-22', 'morning-momentum', 1, 0),
  ('2026-04-22', 'focus-sprint', 1, 50),
  ('2026-04-22', 'arena-move', 1, 1),
  ('2026-04-22', 'night-reset', 1, 0),
  ('2026-04-23', 'morning-momentum', 1, 0),
  ('2026-04-23', 'focus-sprint', 0, 25),
  ('2026-04-23', 'arena-move', 1, 1),
  ('2026-04-23', 'night-reset', 1, 0),
  ('2026-04-24', 'morning-momentum', 1, 0),
  ('2026-04-24', 'focus-sprint', 1, 50),
  ('2026-04-24', 'arena-move', 0, 0),
  ('2026-04-24', 'night-reset', 1, 0),
  ('2026-04-25', 'morning-momentum', 1, 0),
  ('2026-04-25', 'focus-sprint', 0, 15),
  ('2026-04-25', 'arena-move', 0, 0),
  ('2026-04-25', 'night-reset', 1, 0),
  ('2026-04-26', 'morning-momentum', 1, 0),
  ('2026-04-26', 'focus-sprint', 1, 50),
  ('2026-04-26', 'arena-move', 1, 1),
  ('2026-04-26', 'night-reset', 0, 0),
  ('2026-04-27', 'morning-momentum', 1, 0),
  ('2026-04-27', 'focus-sprint', 1, 50),
  ('2026-04-27', 'arena-move', 1, 1),
  ('2026-04-27', 'night-reset', 1, 0),
  ('2026-04-28', 'morning-momentum', 1, 0),
  ('2026-04-28', 'focus-sprint', 0, 25),
  ('2026-04-28', 'arena-move', 1, 1),
  ('2026-04-28', 'night-reset', 1, 0),
  ('2026-04-29', 'morning-momentum', 1, 0),
  ('2026-04-29', 'focus-sprint', 1, 50),
  ('2026-04-29', 'arena-move', 0, 0),
  ('2026-04-29', 'night-reset', 1, 0),
  ('2026-04-30', 'morning-momentum', 1, 0),
  ('2026-04-30', 'focus-sprint', 1, 50),
  ('2026-04-30', 'arena-move', 1, 1),
  ('2026-04-30', 'night-reset', 0, 0);

INSERT OR REPLACE INTO daily_option_uses (date, option_id, uses_count) VALUES
  ('2026-04-30', 'focus-pomodoro', 2),
  ('2026-04-30', 'focus-review', 0),
  ('2026-04-30', 'focus-reading', 0);

INSERT OR REPLACE INTO quest_rewards (quest_id, reward_id) VALUES
  ('morning-momentum', 'reward-friday-treat'),
  ('focus-sprint', 'reward-game-time'),
  ('arena-move', 'reward-gear-drop'),
  ('night-reset', 'reward-friday-treat'),
  ('weekly-stack', 'reward-gear-drop'),
  ('monthly-boss', 'reward-game-time'),
  ('epic-reputation', 'reward-gear-drop');
