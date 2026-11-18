-- Sweden on D1. The same data as the Deno KV layout (api/db/keys.ts), as tables.

-- A browser, identified by the HttpOnly cookie sw_did. user_ids is a JSON array in
-- creation order (at most 8). expires_at is set only while the device holds no profile,
-- so drive-by traffic is pruned by the daily cron (src/index.ts) after 7 days.
CREATE TABLE devices (
  id             TEXT PRIMARY KEY,
  user_ids       TEXT NOT NULL DEFAULT '[]',
  active_user_id TEXT,
  created_at     INTEGER NOT NULL,
  expires_at     INTEGER
);
CREATE INDEX devices_expires ON devices (expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  animal     TEXT NOT NULL,
  color      TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- The rolling history: 180 days, pruned by the cron. The aggregates below are the
-- durable state.
CREATE TABLE visits (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  at      INTEGER NOT NULL,
  page_id TEXT NOT NULL,
  kind    TEXT NOT NULL,
  ms      INTEGER,
  score   INTEGER
);
CREATE INDEX visits_user_at ON visits (user_id, at DESC, id DESC);
CREATE INDEX visits_at ON visits (at);

-- Per user and page. A user's total is SUM(count): KV kept it as its own counter
-- because KV cannot sum; the two were always equal.
CREATE TABLE page_stats (
  user_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  count   INTEGER NOT NULL,
  last_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, page_id)
);

-- Across all users. Written, not read by the app yet (as in KV).
CREATE TABLE page_totals (
  page_id TEXT PRIMARY KEY,
  total   INTEGER NOT NULL
);
